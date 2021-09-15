/**
 * Replace __dirname and __filename with esm module versions
 *
 * ```typescript
 * const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
 * const __filename = url.fileURLToPath(import.meta.url);
 * ```
 *
 * @param {import('jscodeshift').FileInfo} fileInfo
 * @param {import('jscodeshift').API} api
 */
export default function tsDirname(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const dirName = root.find(j.Identifier, { name: '__dirname' });
  const fileName = root.find(j.Identifier, { name: '__filename' });

  const needsDirName = dirName.size() > 0;
  const needsFileName = fileName.size() > 0;

  const hasPath = fileInfo.source.includes('import path') || fileInfo.source.includes('import * as path');
  const hasUrl = fileInfo.source.includes('import url') || fileInfo.source.includes('import * as url');
  const hasDirNameDec = fileInfo.source.includes('const __dirname =');
  const hasFileNameDec = fileInfo.source.includes('const __filename =');

  if (needsDirName || needsFileName) {
    const imports = root.find(j.Declaration);
    const firstImport = imports.at(0).get();
    if (!hasPath) {
      const stmt = j.template.statement`import path from 'path';\n`;
      firstImport.insertBefore(stmt);
    }
    if (!hasUrl) {
      const stmt = j.template.statement`import url from 'url';\n`;
      firstImport.insertBefore(stmt);
    }

    if (needsDirName && !hasDirNameDec) {
      const stmt = j.template.statement`const __dirname = path.dirname(url.fileURLToPath(import.meta.url));\n`;
      firstImport.insertBefore(stmt);
    }
    if (needsFileName && !hasFileNameDec) {
      const stmt = j.template.statement`const __filename = url.fileURLToPath(import.meta.url);\n`;
      firstImport.insertBefore(stmt);
    }
  }

  return root.toSource();
}
