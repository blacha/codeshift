# jscodeshift transformers

Usage

```
jscodeshift --transform=src/ts-import-add-ext.js --parser ts :pathToTypescriptFiles
```

## src/ts-import-add-ext.js

Converts Typescript files that use `import {foo} from './bar'` into ESM module imports `import {foo} from './bar.js'`

Examples

- `import {foo} from './bar'` -> `import {foo} from './bar.js'`
- `export {foo} from './bar'` -> `export {foo} from './bar.js'`
- `export * from './bar'` -> `export * from './bar.js'`

