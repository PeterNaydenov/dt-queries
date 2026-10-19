## Release History



### 2.0.0 ( 2026-10-19)
- [x] Breaking: `dt-toolbox` >= 8.1.0 is a peer dependency. All queries set dt-lines by path (`store.set ( 'root/a/tags', data )`), and older versions of dt-toolbox don't support it;
- [x] Performance: All queries set dt-lines by path instead of `set ( name )` + `connect`. `connect` checks every child of the parent, so large arrays and objects were quadratic. Time for 2000 records: `change`, `identical`, `same`, `missing`, `different`, `append`, `prepend` are 1.9-2.2× faster, `add` 1.4×, `update` 1.2×;
- [x] Performance: `overwrite` and `insert` keep the visited breadcrumbs in a `Set` instead of an array. 2000 records: `overwrite` 61 ms → 9 ms, `insert` 61 ms → 16 ms;
- [x] Performance: `combine` reads the incoming dt-line by `index` instead of a full scan of the incoming data for each object. 2000 records: 2855 ms → 43 ms;
- [x] Performance: `keepSegments`, `removeSegments`, `joinSegments`, `splitSegments` and `updateState` set dt-lines by path. 8000 records in 4 segments: `keepSegments` 76 ms → 6 ms, `removeSegments` 102 ms → 17 ms, `joinSegments` 59 ms → 26 ms, `splitSegments` 249 ms → 25 ms, `updateState` 74 ms → 22 ms. `updateState` reads the 'root' dt-line of the changes with `index` instead of exporting all dt-lines under it;
- [x] Fix: Repeated names. Data like `{ a: { tags }, b: { tags } }` or nested arrays (items are named '0', '1', ... on every level) lost data or put it at the wrong place, and `same`, `missing`, `keepSegments` could crash with "Maximum call stack size exceeded". With equal data on both sides, `update`, `overwrite`, `same`, `add` and `insert` returned wrong results in 4-9% of random tests with unique keys and in 29-36% with repeated keys. Now 0%;
- [x] Fix: `add` threw on new keys with RegExp special characters (e.g. `'p(q'`);
- [x] Fix: `add` threw on an object that became an array (`{ o: {x:1} }` + `{ o: [5] }`); now the original stays. In arrays, a new value was replaced by an original object at the end of the array (`[ 1, {k:1} ]` + `[ 3 ]` lost `3`), and a new incoming object replaced a new value (`[ 1 ]` + `[ 2, {k:1}, 3 ]` lost `2`). Now new values and new objects go to the end of the array, and an incoming object on the place of an original object of the same type gets only its new keys;
- [x] Fix: Arrays with objects and primitives. An object item of an array is a separate dt-line, placed by index. `missing`, `identical` and `combine` removed its place from the array, so the next values moved and the object item replaced one of them (`missing` of `[ 3, {k:1}, 'a' ]` lost `'a'`). `change` and `missing` returned `[ null, {} ]` for equal arrays. Now items with own dt-lines keep their place, only primitives are filtered, and a moved item takes its deep structure with it. In `combine`, new incoming object items go to the end of the array;
- [x] Fix: Arrays taken from the update. `change` and `overwrite` took only the values of the incoming array; its objects stayed from the original. An original object could replace an incoming value (`[ {a:1} ]` updated with `[ 7, 8 ]` gave `[ {a:1}, 8 ]`), incoming objects were lost, and original objects stayed after a shorter incoming array. Now the array comes whole from the update: values, objects and their deep structure. The same for a structure that changed its type (object ↔ array) in `change` and `overwrite`;
- [x] Breaking: `update` shows which keys of the original data are changed by the update, and how. A changed value is shown with its new value. Keys without changes, keys missing in the update and new keys are not shown. In arrays a change keeps its exact place (index); places without changes stay empty (`undefined`). A value that became a structure, or a changed structure (object <-> array), is shown as an empty structure of the new type; a structure that became a value shows the value. A structure without changes is not shown. Before, `update` returned the original data with updated values;
- [x] Breaking: `different` keeps the exact place of values in arrays. A new or changed value is shown on its index, places without differences stay empty (`undefined`), and object items keep their index (`[ 1, 2 ]` vs `[ 1, 3 ]` gives `3` on index 1). Before, a changed array came whole and object items moved to the start. All structures of the update are still in the result, empty when they have no differences;
- [x] Breaking: `same` keeps the structure of the original data and takes primitive values from the update. Keys, structures and array lengths stay as in the original. A primitive takes the update value when the update has a primitive on the same place (arrays: the same index), otherwise the original value stays. New keys and structures of the update are not applied. Before, keys missing in the update were removed, missing structures became empty, and arrays and changed structures were taken from the update;
- [x] Fix: `identical` returned an empty structure for a structure that became a primitive (`{ a: {x:1} }` vs `{ a: 2 }` gave `{ a: {} }`). Now `a` is absent, because it is not identical;
- [x] Breaking: `identical` compares object values strictly (`===`), like array values and the other queries. Before, `1` and `'1'`, `0` and `''`, `true` and `1` were identical, and a key with value `null` was identical to a missing key;
- [x] Breaking: `missing` returns the keys of the original data that the update doesn't mention, with the original values. A key that the update has in any form (value or structure, also `null`) is not missing. Before, a key with value `null` in the update, a primitive that became a structure and a changed structure (object <-> array) were reported as missing;
- [x] Fix: `change` hid some changes. A structure that became a primitive gave an empty structure (`{ a: {x:1} }` -> `{ a: 2 }` gave `{ a: {} }`), and a primitive that became a structure was lost. An array that lost or got an object at its end looked unchanged. Now these are changes and show the update value;
- [x] Fix: `overwrite` with a structure that became a primitive (`{ a: {x:1} }` + `{ a: 2 }`). The original structure stayed as a separate data segment, so the `std` model showed `{ a: {x:1} }`. Now the incoming value wins;
- [x] Fix: `overwrite` extend mode (`[ '...', ... ]`) with objects. An incoming object was merged into the original object on the same index instead of going to the end, and a new value could be replaced by an original object at the end of the array. Now the original items stay and new values and objects go to the end;
- [x] Breaking: `prepend` puts new array values at the start of the array. Before, they went to the end, like in `append`;
- [x] Fix: `insert` with objects in arrays. A new value was replaced by an original object at the end of the array, an incoming object left a `null`, and new arrays lost their objects. Now new values and new objects go to the end of the array, and new arrays come with their data. A changed structure is ignored, as documented: an array no longer takes the values of an incoming object;
- [x] Fix: `append` and `prepend` keep the original structure when it changed its type (object <-> array), as documented. Before, they took the incoming structure;
- [x] Fix: `append` and `prepend` with objects in arrays. A new value replaced an original object at the end of the array, and an object of the incoming array left a `null`;
- [x] Fix: A dt-line whose parent is not in the result (e.g. a new structure under a key that is a primitive in the original data) is skipped. Before the fix, it became a separate data segment, and the `std` model showed it as a top-level key;
- [x] Fix: `keepSegments` and `removeSegments` with a single segment attached all nested structures directly to the 'root';
- [x] Fix: `keepSegments` and `removeSegments` with more segments in the result but without the 'root' returned a dt-object without a 'root'. Now the 'root' is empty;
- [x] Fix: `splitSegments` lost an existing segment when a structure of the 'root' had the same name. Now that structure stays in the 'root';
- [x] Fix: `joinSegments` turned every structure of the 'root' into a separate data segment;
- [x] Fix: `combine` lost values when the two sides had different forms. An object and a value (`{ a: {x:1} }` + `{ a: 2 }`) lost the value, an object and an array mixed the array values into the object keys, an incoming object paired with a value lost its deep structure, and a value taken into an array with objects replaced one of them. Now an object and a value, or an object and an array, become a pair `[ incoming, original ]`, and an array takes a value in while its objects keep their place;
- [x] Fix: `combine` threw `name.includes is not a function` when the incoming data had a structure on the place of an array value;
- [x] Fix: `combine` threw when the incoming data didn't have an object or the parent of an array of the original data;
- [x] Fix: `updateState` lost the structures of the state 'root' (e.g. `o` in `{ theme, o: {x:1} }`), also without changes. Now a root structure is kept, or taken whole from the changes when they have it;
- [x] Fix: `updateState` took the value from the state instead of the changes, when the changes replace a state segment with a root property. The segment was lost and the property was `undefined`;
- [x] Tests: `test/06_repeated_names.test.js` with 22 regression tests and 31 new tests in `test/05_bugfixes.test.js`, 3 tests for the new `different` rules, 5 tests for the new `same` rules, 5 for the new `update` rules and 3 for `add`. The suite goes from 63 to 131 passing;
- [x] Dev dependency update. dt-toolbox@8.1.3, rollup@4.64.7;



### 1.1.8 ( 2026-10-15)
- [x] Dependency update. dt-toolbox@8.1.2;



### 1.1.7 ( 2026-10-14)
- [x] Dependency update. dt-toolbox@8.0.0;



### 1.1.6 ( 2026-09-02)
- [x] Feature: Added a skill at `.agents/skills/git-dt-queries/SKILL.md`;
- [x] Dependency update. dt-toolbox@7.5.0;
- [x] Dev dependency update. Mocha@12.0.0;



### 1.1.5 ( 2026-08-12)
- [x] Dependency update. dt-toolbox@7.4.9;



### 1.1.4 ( 2026-07-17)
- [x] Dependency update. dt-toolbox@7.4.7;



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




