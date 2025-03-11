# jscodeshift transformers

Usage

```
npx jscodeshift --transform=src/ts-import-add-ext-ts.js --parser ts ~/git/project/src/**/*.ts
```

## src/ts-import-add-ext-ts.js

Converts Typescript files that use `import {foo} from './bar'` into ESM module imports `import {foo} from './bar.ts'`

Examples

Before:
```typescript
import { Foo } from './bar';
export { Bar } from './bar';
export * from './baz.js';
```

After: 

```typescript
import { Foo } from './bar.ts';
export { Bar } from './bar.ts';
export * from './baz.ts';
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