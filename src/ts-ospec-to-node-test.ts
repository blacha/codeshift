import { API, FileInfo } from 'jscodeshift';

const allowedAsserts = new Map([
  ['notEquals', 'notEqual'],
  ['deepEquals', 'deepEqual'],
  ['equals', 'equal'],
  ['throws', 'throws'],
]);

export default function tsEsm(fileInfo: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const oSpecImport = root.find(j.ImportDeclaration).filter((node) => node.node.source.value === 'ospec');
  if (oSpecImport.size() === 0) return root.toSource();

  const requireImports: Record<string, boolean> = {};

  root.find(j.CallExpression).forEach((e) => {
    const callee = e.node.callee;
    if (callee.type === 'MemberExpression') {
      if (callee.object.type === 'CallExpression' && callee.property.type === 'Identifier') {
        if (callee.object.callee.type === 'Identifier' && callee.object.callee.name === 'o') {
          const assertReplace = allowedAsserts.get(callee.property.name);
          if (assertReplace) {
            e.replace(
              j.callExpression(j.memberExpression(j.identifier('assert'), j.identifier(assertReplace)), [
                ...callee.object.arguments,
                ...e.node.arguments,
              ]),
            );
          } else {
            console.log(callee.property.name);
            throw new Error('Unknown assertion');
          }
          return;
        }
      }

      if (callee.object.type === 'Identifier' && callee.object.name === 'o') {
        // o.before or o.after etc..
        if (callee.property.type === 'Identifier') {
          // convert "o.spec" into "describe()"
          if (callee.property.name === 'spec') {
            requireImports['describe'] = true;
            e.replace(j.callExpression(j.identifier('describe'), e.node.arguments));
            return;
          }
          // convert o.before() => before() o.beforeEach() => beforeEach()
          switch (callee.property.name) {
            case 'before':
            case 'after':
            case 'afterEach':
            case 'beforeEach':
              requireImports[callee.property.name] = true;
              e.replace(j.callExpression(j.identifier(callee.property.name), e.node.arguments));
              return;
            default:
              throw new Error(`unknown o usage?: ${callee.object.name}.${callee.property.name}`);
          }
        }
      }

      return;
    }

    if (callee.type === 'Identifier' && callee.name === 'o') {
      if (e.node.arguments.length === 2) {
        const [argA, argB] = e.node.arguments;
        if (
          (argA?.type === 'StringLiteral' || argA?.type === 'BinaryExpression') &&
          (argB?.type === 'ArrowFunctionExpression' || argB?.type === 'FunctionExpression')
        ) {
          // o('foo', () => {})       => it('foo', () => {})
          // o('foo', function() {})  => it('foo', function() {})
          requireImports['it'] = true;
          e.replace(j.callExpression(j.identifier('it'), e.node.arguments));
          return;
        }

        return;
      }
    }
    return;
  });

  // Add assert library
  const importAssert = j.importDeclaration(
    [j.importDefaultSpecifier(j.identifier('assert'))],
    j.stringLiteral('node:assert'),
  );

  // add the required describe/it import
  const importTest = j.importDeclaration(
    [...Object.keys(requireImports).map((imp) => j.importSpecifier(j.identifier(imp)))],
    j.stringLiteral('node:test'),
  );

  let imported = false;
  oSpecImport.forEach((e) => {
    // Already imported node:test so extra import ospec
    if (imported) {
      j(e).remove();
      return;
    }
    imported = true;
    e.replace(importTest, importAssert);
  });

  console.log('\tOspec found', requireImports);
  return root.toSource();
}
