const fs = require('fs');
const path = require('path');

/**
 *
 * @param {string} filePath
 * @param {string} source
 * @returns {string}
 */
function resolvePath(filePath, source) {
  if (typeof source !== 'string') return source;
  if (source.endsWith('.js')) return source;

  const folderCount = source.split('/').length;
  // @ modules eg @some/package/baz
  if (source.startsWith('@')) {
    if (folderCount > 2) return source + '.js';
    return source;
  }
  // normal import 'some-package/index'
  if (!source.startsWith('.')) {
    if (folderCount > 1) return source + '.js';
    if (source === 'fs/promises') return source;
    return source;
  }

  const pathName = path.join(path.dirname(filePath), source);
  const isFolder = fs.existsSync(pathName);

  if (!isFolder) return source + '.js';
  const output = path.join(source, 'index.js');
  // path.join removes './'
  if (!source.startsWith('.')) return output;
  return './' + output;
}
/**
 * @param {import('jscodeshift').FileInfo} fileInfo
 * @param {import('jscodeshift').API} api
 * @param {import('jscodeshift').Collection<any>} root
 */
export function runTsImportAddExt(fileInfo, api, root) {
  const j = api.jscodeshift;
  function replaceSource(node) {
    const original = node.value;
    const newValue = resolvePath(fileInfo.path, node.value);
    if (original === newValue) return;
    console.log({ original, newValue });
    if (fs.existsSync(node.value)) console.error('FailedToFind : ' + node.value);
    node.value = newValue;
  }

  root.find(j.ImportDeclaration).forEach((f) => replaceSource(f.node.source));
  root.find(j.ExportAllDeclaration).forEach((f) => replaceSource(f.node.source));
  root.find(j.ExportNamedDeclaration).forEach((f) => {
    if (f.node.source == null) return; // export const foo = 'a';
    replaceSource(f.node.source);
  });
}

/**
 * @param {import('jscodeshift').FileInfo} fileInfo
 * @param {import('jscodeshift').API} api
 */
export default function tsImportAddExt(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  runTsImportAddExt(fileInfo, api, root);
  return root.toSource();
}
