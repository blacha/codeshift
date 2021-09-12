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
  if (!source.startsWith('.')) return source;
  if (source.endsWith('.js')) return source;

  const pathName = path.join(path.dirname(filePath), source);
  const isFolder = fs.existsSync(pathName);

  if (!isFolder) return source + '.js';
  const output = path.join(source, 'index.js');
  // path.join removes './'
  if (source.startsWith('.')) return output;
  return './' + output;
}

/**
 * @param {import('jscodeshift').FileInfo} fileInfo
 * @param {import('jscodeshift').API} api
 */
export default function tsImportAddExt(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  function replaceSource(node) {
    const original = node.value;
    const newValue = resolvePath(fileInfo.path, node.value);
    if (original === newValue) return;
    console.log('Replacing', original, '=>', newValue);
    if (fs.existsSync(node.value)) console.error('FailedToFind : ' + node.value);
  }

  root.find(j.ImportDeclaration).forEach((f) => replaceSource(f.node.source));
  root.find(j.ExportAllDeclaration).forEach((f) => replaceSource(f.node.source));
  root.find(j.ExportNamedDeclaration).forEach((f) => {
    if (f.node.source == null) return; // export const foo = 'a';
    replaceSource(f.node.source);
  });

  return root.toSource();
}
