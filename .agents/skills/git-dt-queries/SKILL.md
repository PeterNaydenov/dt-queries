---
name: git-dt-queries
description: |
  Help developers use `@peter.naydenov/dt-queries` (the query function
  library for `@peter.naydenov/dt-toolbox`, v1.1.5): pick the right query
  for the use case (merge / compare / extract / segment), pass it to
  `dt.query(fn, ...args)`, and combine multiple queries in a pipeline.
  Use when a developer asks "how do I diff / merge / split / join two
  dt-objects", "how do I write a custom query for dt-toolbox", or wants
  a reference for the built-in query functions. Do NOT use for:
  dt-toolbox itself (route to the sibling `@peter.naydenov/dt-toolbox`),
  building a brand-new query from scratch (these are reference
  implementations meant as a learning source), or fixing bugs in the
  library itself.
---

# git-dt-queries helper

A set of **reference query functions** for `@peter.naydenov/dt-toolbox`
dt-objects. Each query walks the dt-tree and applies a transform —
compare, merge, extract, or split. The library is thin on its own:
queries are just plain functions you pass to `dt.query(fn, ...args)`.

The README is explicit: *"You can use them for **learning purposes** or
inspiration for how to build your own query functions for DT-Toolbox."*
Treat the built-in queries as a starting point, not a fixed menu.

Source of truth:
- `src/main.js` — re-exports the 15 queries
- `src/compareMethods/` — `change`, `different`, `identical`, `missing`, `same`
- `src/mergeMethods/` — `add`, `append`, `combine`, `insert`, `overwrite`, `prepend`, `update`
- `src/extractMethods/` — `keepSegments`, `removeSegments`
- `src/state/` — `joinSegments`, `splitSegments`, `updateState`
- `test/01_compare.test.js`, `test/02_merge.test.js`, `test/03_extract.test.js`, `test/04_state.tes.js`, `test/05_bugfixes.test.js` — executable examples
- `README.md` — the four-category listing

## Procedure

1. **Make sure the developer has a dt-toolbox dt-object first.** The queries don't work on plain JS objects; they need a `dt` from `dtbox.init(data)`. If they're starting from a raw object, point them to `@peter.naydenov/dt-toolbox` and have them call `dtbox.init(...)` first.

2. **Map the developer's intent to a query category**:
   - "Diff two dt-objects" / "What's different between A and B" / "What changed" → **Compare** queries: `change`, `different`, `identical`, `missing`, `same`
   - "Merge two dt-objects" / "Combine A into B" / "Patch B with A" / "Add fields from A" → **Merge** queries: `add`, `update`, `overwrite`, `insert`, `append`, `prepend`, `combine`
   - "Pull out only the `user.*` segments" / "Strip out the `internal.*` segments" → **Extract** queries: `keepSegments`, `removeSegments`
   - "Split this solid object into segments" / "Merge segments back" / "Update only declared state fields" → **Segment** queries: `splitSegments`, `joinSegments`, `updateState`

3. **Generate code that follows the real call pattern**:
   - ESM import: `import dtbox from 'dt-toolbox'` plus a named import for the query — `import { identical } from '@peter.naydenov/dt-queries'`. The library has **no default export**; it exports only named functions. Importing `dtQueries` (default) will be `undefined`.
   - The call shape is `dt.query(queryFn, ...args)`. The query is always the first arg, the rest are the query's own inputs (typically the dt-object to compare against / patch from).
   - Example: `const result = dt.query(identical, otherDt)`. The result shape depends on the query — compare queries return dt-objects, merge queries mutate the receiver dt-object in place, segment queries mutate too.
   - For merge queries, the **receiver** is the `dt` you call `query` on. The **donor** is the dt-object you pass as the first arg after the query. `dt.query(add, donor)` adds new keys from `donor` to `dt` without overwriting existing values.

4. **Pick the right merge verb for the use case** — merge is where the vocabulary matters most:
   - `add` — add only keys that don't already exist; keep existing values
   - `update` — overwrite existing keys with new values; don't add new ones (verify in the specific implementation; some "update" variants can add)
   - `overwrite` — replace the entire tree
   - `insert` / `append` / `prepend` — work on array-typed segments
   - `combine` — recursive deep merge (objects + arrays, with specific rules)
   - When in doubt, the README is the index: it lists each query by name with a one-line description

5. **Pick the right compare verb for the use case**:
   - `identical` — strict equal at every leaf (default comparison)
   - `same` — same shape (keys, types) regardless of value
   - `change` — keys whose values differ
   - `different` — keys that exist in only one side (asymmetric)
   - `missing` — the inverse of `different` (which keys are absent on one side)
   - Use `change` to produce a patch. Use `missing` / `different` to drive a sync. Use `identical` / `same` for a quick equality check.

6. **Pick the right segment verb**:
   - `splitSegments` — break a "solid" (single-segment) dt into one segment per top-level key
   - `joinSegments` — collapse a multi-segment dt back into a single solid
   - `updateState` — apply a partial update that **only touches declared segments**, never inventing new ones (good for state machines / strict schemas)

7. **Surface only the relevant gotcha proactively** — pick at most one from the list below that applies to the current example, and only if the user is unlikely to know it:
   - **There's no default export.** `import dtQueries from '@peter.naydenov/dt-queries'` will be `undefined`. Always use named imports.
   - **The queries need a dt-object, not a plain object.** If the user calls `dt.query(identical, rawObject)`, it'll fail inside the query (most queries `look()` on the first arg). Initialize with `dtbox.init(...)` first.
   - **Merge queries mutate the receiver in place.** `dt.query(add, donor)` does not return a new dt — it modifies `dt`. Don't write `const newDt = dt.query(add, donor)` expecting an immutable result.
   - **The library is meant as reference, not a fixed menu.** If the built-in queries don't fit, the README invites you to write your own — the source in `src/compareMethods/`, `src/mergeMethods/`, etc. is short and well-isolated. Use these as templates.

8. **If the request is "I need to deep-clone / diff / merge plain JS objects"** (not dt-objects), this is the wrong library. Point the user at `@peter.naydenov/walk` for deep walk + transform, or `structuredClone` for plain deep copy.

9. **If the request is "I want to compare my dt to a JSON schema"** or **"I want to validate types in my dt"**, this library is the wrong layer — use a schema validator, or write a custom query that does the validation. `identical` / `same` are structural only.

## Output contract

- One focused code snippet, ESM by default (CJS if asked). The snippet must:
  - import `dt-toolbox` AND the named query
  - show `dtbox.init(...)` for any data that isn't already a dt
  - show the `dt.query(fn, ...)` call
- One line of context explaining which query was picked and why
- A pointer to the relevant source/test section if the developer wants to dig deeper
- Surface at most one relevant gotcha proactively, only if it applies to the example
- Never include a code example that uses `import dtQueries from '@peter.naydenov/dt-queries'` (no default export)
- Never include a code example that passes a plain JS object to a query without `dtbox.init(...)` first

## Failure handling

- The developer's use case genuinely ambiguous (e.g., "merge two things") → ask one clarifying question (replace? add new? deep merge?), then pick the closest merge verb
- Developer reports a bug or unexpected behavior in a query → do NOT try to fix from this skill; route to the project source or maintainer
- Developer asks for a query that doesn't exist (e.g., "diff that ignores key order") → point at the four source directories as templates for writing a custom query; the README explicitly invites this
- Developer wants to use the queries on a non-dt data structure → they need to wrap it in `dtbox.init(...)` first; if they're starting from scratch, they may not need dt-toolbox at all

## Examples

**"What's different between my current state and the new state?"**

```js
import dtbox from 'dt-toolbox'
import { change } from '@peter.naydenov/dt-queries'

const current = dtbox.init({ user: { name: 'A', age: 30 }, flags: { beta: true } })
const next    = dtbox.init({ user: { name: 'A', age: 31 }, flags: { beta: true } })

const diff = current.query(change, next)
// `diff` is a dt-object containing only the keys whose values differ,
// in this case: { user: { age: 31 } }
```

`change` returns a dt-object with the differing keys + their new values. Use it to produce a minimal patch. See `src/compareMethods/change.js` and the "Compare operations" section in the README.

**"Merge new fields into my store without overwriting existing values"**

```js
import dtbox from 'dt-toolbox'
import { add } from '@peter.naydenov/dt-queries'

const store  = dtbox.init({ name: 'A', version: 1, internal: { id: 'x' } })
const update = dtbox.init({ name: 'A', version: 2, newField: true, internal: { id: 'y', extra: 'z' } })

store.query(add, update)
// store is now: { name: 'A', version: 1, internal: { id: 'x', extra: 'z' }, newField: true }
//   - `name` kept (A) — `add` doesn't overwrite existing keys
//   - `version` kept (1) — same reason
//   - `internal.id` kept (x) — same reason
//   - `internal.extra` added (z) — new key in nested object
//   - `newField` added (true) — new top-level key
```

`add` is the "patch without overwrite" verb — perfect for merging server responses into local state without clobbering local edits. See `src/mergeMethods/add.js`.

**"Apply a partial update that only touches declared segments"**

```js
import dtbox from 'dt-toolbox'
import { updateState } from '@peter.naydenov/dt-queries'

const state = dtbox.init({ mode: 'idle', lastSeen: 0, rogue: 'data' })
const patch = dtbox.init({ mode: 'running', lastSeen: Date.now() })

state.query(updateState, patch)
// state is now: { mode: 'running', lastSeen: <new>, rogue: 'data' }
//   - `mode` updated
//   - `lastSeen` updated
//   - `rogue` UNCHANGED — it's not a declared segment, so `updateState` ignores it
```

`updateState` is the schema-enforcing verb — perfect for state-machine updates where the patch might be tampered with or have extra fields you don't want to apply. See `src/state/updateState.js`.
