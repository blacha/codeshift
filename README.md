# jscodeshift transformers

Usage

```
jscodeshift --transform=src/ts-import-add-ext.js --parser ts :pathToTypescriptFiles
```

## src/ts-import-add-ext.js

Converts Typescript files that use `import {foo} from './bar'` into ESM module imports `import {foo} from './bar.js'`

Examples

Before:
```typescript
import { Foo } from './bar';
export { Bar } from './bar';
export * from './baz';
```

After: 

```typescript
import { Foo } from './bar.js';
export { Bar } from './bar.js';
export * from './baz.js';
```

## src/ts-dirname.js

Converts `__dirname` and `__filename` into ESM module constants

```typescript
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const __filename = url.fileURLToPath(import.meta.url);
```

## src/ospec-to-node-test.js