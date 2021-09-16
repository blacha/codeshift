import { runTsImportAddExt } from './ts-import-add-ext';
import { runTsDirName } from './ts-dirname';

export default function tsEsm(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  runTsImportAddExt(fileInfo, api, root);
  runTsDirName(fileInfo, api, root);
  return root.toSource();
}
