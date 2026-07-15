## Release History


### 1.1.3 ( 2026-07-15)
- [x] Fix: Added missing build;



### 1.1.2 ( 2026-07-15)
- [x] Fix: Compare queries (`identical`, `change`, `same`, `missing`) crashed with `Cannot read properties of null/undefined (reading 'index')` when called without a second argument, with `null`, `undefined`, or a plain (non-dt) object as the update. Each function now guards on `if (!update) return null` before accessing `update.index`, so the call becomes a no-op (the result store is returned unchanged) instead of throwing;
- [x] Fix: `different` and `add` crashed with a confusing `index is not a function` error when the third `index` argument was missing or not a function. Each function now validates `update` is a dt-object (has `.query`) and `index` is a function, returning `null` on bad input instead of throwing;
- [x] Tests: Added `test/05_bugfixes.test.js` with regression tests for the fixes above (39 new tests; suite goes from 24 to 63 passing);
- [x] Bug: Missing build;



### 1.1.1 ( 2024-12-07)
- [x] Dev dependency update. dt-toolbox@7.4.3;
- [x] Dev dependency update. Mocha@11.0.1;
- [x] Dev dependency update. Rollup@4.28.1;



### 1.1.0 ( 2024-02-03)
- [x] Dev dependency update. dt-toolbox@7.4.2;
- [x] Dev dependency update. Chai@5.0.3;
- [x] Folder 'dist' was added to the project. Includes commonjs, umd and esm versions of the library;
- [x] Package.json: "exports" section was added. Allows you to use package as commonjs or es6 module without additional configuration;
 - [x] Rollup was added to the project. Used to build the library versions;



### 1.0.4 ( 2024-01-13)
- [x] Dev dependency update. dt-toolbox@7.4.1;
- [x] Dev dependency update. Chai@5.0.0;
- [x] Dev dependency update. C8@9.1.0;

### 1.0.3 ( 2023-10-28)
- [x] Dependency update. dt-toolbox@7.3.0;



### 1.0.2 (2023-09-16)
- [x] Fix: `updateState` breaks on copy a not changed root properties;



### 1.0.1 (2023-09-12)
- [x] Segment operation `splitSegments` was added;
- [x] Segment operation `joinSegments` was added;
- [x] Segment operation `updateState` was added;
- [ ] Bug: `updateState` breaks on copy a not changed root properties;



### 1.0.0 (2023-08-13)
 - [x] Works with 'dt-toolbox' version 7.x.x;


### 0.0.1 (2023-05-12)
 - [x] Initial code;
 - [x] Test package;
 - [x] Works with 'dt-toolbox' version 6.x.x;




