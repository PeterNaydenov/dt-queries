/**
 *  Regression tests for bug fixes in dt-queries.
 *
 *  Each `it()` block documents a specific bug that was fixed.
 *  Grouped by source file.
 *
 *  Note on validation contract: when a query function detects invalid
 *  arguments, it returns `null` from the inner fn. dt-toolbox's `query()`
 *  sees an empty `selection` and returns the original store unchanged
 *  (so the caller gets back a valid dt-object that has not been modified
 *  by the failed operation).
 */



import { expect } from "chai"
import dtbox from "dt-toolbox"
import {
              change
            , different
            , identical
            , missing
            , same
            , add
            , combine
            , updateState
            , append
            , prepend
            , overwrite
            , insert
            , keepSegments
            , removeSegments
            , splitSegments
        } from '../src/main.js'



const a = {
              name: 'Peter'
            , age  : 49
            , friends : [ 'Ivan', 'Dobroslav' ]
            , personal : {
                                eyes  : 'blue'
                            , sizes : [ 10, 44, 'm' ]
                        }
        }



// Helper: turn a dt-object into a plain JS object for comparison
const toModel = ( dt ) => dt.model(() => ({as:'std'}))



// =============================================================================
// Bug 1: identical() crashed when called without a second argument
//        (or with null/undefined) because `update.index` was accessed before
//        any null check. Fix: add `if (!update) return null` before the
//        existing `update.index` validation.
//
//        Behaviour after the fix: function does not throw, and dt-toolbox
//        returns the original store unchanged because nothing was written
//        to the selection.
// =============================================================================
describe ( 'Bug fix: identical input validation', () => {

    it ( 'does not throw when called without an update argument', () => {
        expect ( () => dtbox.init(a).query(identical) ).to.not.throw()
    })

    it ( 'returns the original data unchanged when update is missing', () => {
        const r = dtbox.init(a).query(identical)
        expect ( toModel(r) ).to.deep.equal(a)
    })

    it ( 'does not throw when update is null', () => {
        expect ( () => dtbox.init(a).query(identical, null) ).to.not.throw()
    })

    it ( 'returns the original data unchanged when update is null', () => {
        const r = dtbox.init(a).query(identical, null)
        expect ( toModel(r) ).to.deep.equal(a)
    })

    it ( 'does not throw when update is undefined', () => {
        expect ( () => dtbox.init(a).query(identical, undefined) ).to.not.throw()
    })

    it ( 'returns the original data unchanged when update is undefined', () => {
        const r = dtbox.init(a).query(identical, undefined)
        expect ( toModel(r) ).to.deep.equal(a)
    })

    it ( 'does not throw when update is a plain object (no .index method)', () => {
        expect ( () => dtbox.init(a).query(identical, { a: 1 }) ).to.not.throw()
    })

    it ( 'returns the original data unchanged when update is a plain object', () => {
        const r = dtbox.init(a).query(identical, { a: 1 })
        expect ( toModel(r) ).to.deep.equal(a)
    })
})



// =============================================================================
// Bug 2: change() crashed when called without a second argument (same root
//        cause as identical). Fix: same null guard before the index check.
// =============================================================================
describe ( 'Bug fix: change input validation', () => {

    it ( 'does not throw when called without an update argument', () => {
        expect ( () => dtbox.init(a).query(change) ).to.not.throw()
    })

    it ( 'returns the original data unchanged when update is missing', () => {
        const r = dtbox.init(a).query(change)
        expect ( toModel(r) ).to.deep.equal(a)
    })

    it ( 'does not throw when update is null', () => {
        expect ( () => dtbox.init(a).query(change, null) ).to.not.throw()
    })

    it ( 'returns the original data unchanged when update is null', () => {
        const r = dtbox.init(a).query(change, null)
        expect ( toModel(r) ).to.deep.equal(a)
    })

    it ( 'does not throw when update is undefined', () => {
        expect ( () => dtbox.init(a).query(change, undefined) ).to.not.throw()
    })

    it ( 'does not throw when update is a plain object', () => {
        expect ( () => dtbox.init(a).query(change, { a: 1 }) ).to.not.throw()
    })

    it ( 'still works correctly with valid dt-object input', () => {
        const b = { name: 'Stefan', age: 30, friends: [ 'Ivan' ], personal: { eyes: 'blue', sizes: [10] } }
        const r = dtbox.init(a).query(change, dtbox.init(b))
        // only "age" really differs; size changes too
        expect ( toModel(r) ).to.have.property('age', 30)
    })
})



// =============================================================================
// Bug 3: same() crashed when called without a second argument. Same fix.
// =============================================================================
describe ( 'Bug fix: same input validation', () => {

    it ( 'does not throw when called without an update argument', () => {
        expect ( () => dtbox.init(a).query(same) ).to.not.throw()
    })

    it ( 'returns the original data unchanged when update is missing', () => {
        const r = dtbox.init(a).query(same)
        expect ( toModel(r) ).to.deep.equal(a)
    })

    it ( 'does not throw when update is null', () => {
        expect ( () => dtbox.init(a).query(same, null) ).to.not.throw()
    })

    it ( 'does not throw when update is undefined', () => {
        expect ( () => dtbox.init(a).query(same, undefined) ).to.not.throw()
    })

    it ( 'does not throw when update is a plain object', () => {
        expect ( () => dtbox.init(a).query(same, { a: 1 }) ).to.not.throw()
    })
})



// =============================================================================
// Bug 4: missing() — even though the original `if (!update.index && ...)`
//        guard was present, the guard itself crashed when `update` was null
//        because `update.index` is evaluated before the type check. Fix:
//        add the same `if (!update) return null` guard as the other
//        compare functions.
// =============================================================================
describe ( 'Bug fix: missing input validation', () => {

    it ( 'does not throw when called without an update argument', () => {
        expect ( () => dtbox.init(a).query(missing) ).to.not.throw()
    })

    it ( 'returns the original data unchanged when update is missing', () => {
        const r = dtbox.init(a).query(missing)
        expect ( toModel(r) ).to.deep.equal(a)
    })

    it ( 'does not throw when update is null', () => {
        expect ( () => dtbox.init(a).query(missing, null) ).to.not.throw()
    })

    it ( 'does not throw when update is undefined', () => {
        expect ( () => dtbox.init(a).query(missing, undefined) ).to.not.throw()
    })

    it ( 'does not throw when update is a plain object', () => {
        expect ( () => dtbox.init(a).query(missing, { a: 1 }) ).to.not.throw()
    })
})



// =============================================================================
// Bug 5: different() crashed with a confusing "index is not a function" error
//        when the third `index` argument was missing. Fix: add input
//        validation that returns null when either `update` is missing/not a
//        dt-object or `index` is missing/not a function.
// =============================================================================
describe ( 'Bug fix: different input validation', () => {

    it ( 'does not throw when called with no extra args', () => {
        expect ( () => dtbox.init(a).query(different, dtbox.init({ x: 1 })) ).to.not.throw()
    })

    it ( 'returns the original data unchanged when index is missing', () => {
        const r = dtbox.init(a).query(different, dtbox.init({ x: 1 }))
        expect ( toModel(r) ).to.deep.equal(a)
    })

    it ( 'does not throw when index is null', () => {
        expect ( () => dtbox.init(a).query(different, dtbox.init({ x: 1 }), null) ).to.not.throw()
    })

    it ( 'does not throw when index is not a function', () => {
        expect ( () => dtbox.init(a).query(different, dtbox.init({ x: 1 }), 'not a fn') ).to.not.throw()
    })

    it ( 'does not throw when update is null', () => {
        expect ( () => dtbox.init(a).query(different, null, dtbox.init(a).index) ).to.not.throw()
    })

    it ( 'does not throw when update is a plain object (no .query method)', () => {
        expect ( () => dtbox.init(a).query(different, { a: 1 }, dtbox.init(a).index) ).to.not.throw()
    })

    it ( 'still works with valid dt-object + index', () => {
        const r = dtbox.init(a).query(different, dtbox.init({ name: 'Stefan', extra: 1 }), dtbox.init(a).index)
        expect ( toModel(r) ).to.have.property('extra', 1)
        expect ( toModel(r) ).to.have.property('name', 'Stefan')
    })
})



// =============================================================================
// Bug 6: add() crashed with a confusing "index is not a function" error when
//        the third `index` argument was missing. Fix: same validation as
//        different() — return null on missing/bad arguments.
// =============================================================================
describe ( 'Bug fix: add input validation', () => {

    it ( 'does not throw when called with no extra args', () => {
        expect ( () => dtbox.init(a).query(add, dtbox.init({ x: 1 })) ).to.not.throw()
    })

    it ( 'returns the original data unchanged when index is missing', () => {
        const r = dtbox.init(a).query(add, dtbox.init({ x: 1 }))
        expect ( toModel(r) ).to.deep.equal(a)
    })

    it ( 'does not throw when index is null', () => {
        expect ( () => dtbox.init(a).query(add, dtbox.init({ x: 1 }), null) ).to.not.throw()
    })

    it ( 'does not throw when index is not a function (e.g. number)', () => {
        expect ( () => dtbox.init(a).query(add, dtbox.init({ x: 1 }), 42) ).to.not.throw()
    })

    it ( 'does not throw when update is null', () => {
        expect ( () => dtbox.init(a).query(add, null, dtbox.init(a).index) ).to.not.throw()
    })

    it ( 'does not throw when update is a plain object', () => {
        expect ( () => dtbox.init(a).query(add, { x: 1 }, dtbox.init(a).index) ).to.not.throw()
    })

    it ( 'still works with valid dt-object + index', () => {
        const r = dtbox.init(a).query(add, dtbox.init({ name: 'Stefan', extra: 1 }), dtbox.init(a).index)
        // add() keeps existing data and adds new keys
        const m = toModel(r)
        expect ( m ).to.have.property('name', 'Peter')          // original kept
        expect ( m ).to.have.property('age', 49)               // original kept
        expect ( m ).to.have.property('extra', 1)              // new key added
    })
})



describe ( 'Bug fix: combine with data missing in the incoming object', () => {

    it ( 'does not throw when an object is not in the incoming data', () => {
        const r = dtbox.init({ a: { x: 1 } }).query ( combine, dtbox.init({ b: 1 }) );
        expect ( r.copy() ).to.deep.equal ({ a: { x: 1 }, b: 1 })
    })

    it ( 'does not throw when the parent of an array is not in the incoming data', () => {
        const r = dtbox.init({ a: { l: [ 1 ] } }).query ( combine, dtbox.init({ b: 1 }) );
        expect ( r.copy() ).to.deep.equal ({ a: { l: [ 1 ] }, b: 1 })
    })
}) // describe



describe ( 'Bug fix: updateState takes a root property from the changes', () => {

    it ( 'replaces a state segment with the root property of the changes', () => {
        const state = dtbox.init ({ theme: 'dark' });
        state.insertSegment ( 'user', { name: 'Ivan' } )
        const r = state.query ( updateState, dtbox.init({ user: 'guest' }) );
        expect ( r.listSegments() ).to.deep.equal ([ 'root' ])
        expect ( r.copy() ).to.deep.equal ({ theme: 'dark', user: 'guest' })
    })
}) // describe



describe ( 'Bug fix: strict comparison in identical and missing', () => {

    it ( 'identical: values of different types are not identical', () => {
        const r = dtbox.init({ n: 1, z: 0, t: true, s: 'a' }).query ( identical, dtbox.init({ n: '1', z: '', t: 1, s: 'a' }) );
        expect ( r.copy() ).to.deep.equal ({ s: 'a' })
    })

    it ( 'identical: a key missing in the update is not identical, also when the value is null', () => {
        const r = dtbox.init({ e: null, s: 'a' }).query ( identical, dtbox.init({ s: 'a' }) );
        expect ( r.copy() ).to.deep.equal ({ s: 'a' })
    })

    it ( 'missing: a key with value null in the update is not missing', () => {
        const r = dtbox.init({ a: 1, e: null, x: 3 }).query ( missing, dtbox.init({ a: 2, e: null }) );
        expect ( r.copy() ).to.deep.equal ({ x: 3 })
    })
}) // describe



describe ( 'Bug fix: append and prepend', () => {

    it ( 'append, prepend: a changed structure keeps the original', () => {
        expect ( dtbox.init({ o: { a: 1 } }).query ( append , dtbox.init({ o: [ 1 ] }) ).copy() ).to.deep.equal ({ o: { a: 1 } })
        expect ( dtbox.init({ o: [ 1 ] }).query ( prepend, dtbox.init({ o: { a: 1 } }) ).copy() ).to.deep.equal ({ o: [ 1 ] })
    })

    it ( 'prepend: new array values go at the start', () => {
        const r = dtbox.init({ l: [ 1, 2 ] }).query ( prepend, dtbox.init({ l: [ 3, 1, 4 ] }) );
        expect ( r.copy() ).to.deep.equal ({ l: [ 3, 4, 1, 2 ] })
    })

    it ( 'prepend: object items move after the new values, with their deep structure', () => {
        const r = dtbox.init({ l: [ 1, { k: { deep: [ { z: 1 } ] } } ] }).query ( prepend, dtbox.init({ l: [ 2 ] }) );
        expect ( r.copy() ).to.deep.equal ({ l: [ 2, 1, { k: { deep: [ { z: 1 } ] } } ] })
    })

    it ( 'append: an object at the end of the array is not replaced by a new value', () => {
        const r = dtbox.init({ l: [ 1, { k: 1 } ] }).query ( append, dtbox.init({ l: [ 2 ] }) );
        expect ( r.copy() ).to.deep.equal ({ l: [ 1, { k: 1 }, 2 ] })
    })

    it ( 'append, prepend: objects of the incoming array leave no null', () => {
        expect ( dtbox.init({ l: [ 1 ] }).query ( append , dtbox.init({ l: [ 2, { k: 1 }, 3 ] }) ).copy() ).to.deep.equal ({ l: [ 1, 2, 3 ] })
        expect ( dtbox.init({ l: [ 1 ] }).query ( prepend, dtbox.init({ l: [ 2, { k: 1 }, 3 ] }) ).copy() ).to.deep.equal ({ l: [ 2, 3, 1 ] })
    })
}) // describe



describe ( 'Bug fix: change shows where the changes are', () => {

    it ( 'a structure that became a primitive shows the new value', () => {
        expect ( dtbox.init({ a: { x: 1 }, k: 0 }).query ( change, dtbox.init({ a: 2, k: 0 }) ).copy() ).to.deep.equal ({ a: 2 })
        expect ( dtbox.init({ o: { a: { x: { y: 1 } } } }).query ( change, dtbox.init({ o: { a: 5 } }) ).copy() ).to.deep.equal ({ o: { a: 5 } })
    })

    it ( 'a primitive that became a structure shows the new structure', () => {
        const r = dtbox.init({ a: 1, k: 0 }).query ( change, dtbox.init({ a: { x: { y: 1 } }, k: 0 }) );
        expect ( r.copy() ).to.deep.equal ({ a: { x: { y: 1 } } })
    })

    it ( 'an array that lost or got an object at the end is changed', () => {
        expect ( dtbox.init({ l: [ 1, { k: 1 } ] }).query ( change, dtbox.init({ l: [ 1 ] }) ).copy() ).to.deep.equal ({ l: [ 1 ] })
        expect ( dtbox.init({ l: [ 1 ] }).query ( change, dtbox.init({ l: [ 1, { k: 1 } ] }) ).copy() ).to.deep.equal ({ l: [ 1, { k: 1 } ] })
    })
}) // describe



describe ( 'Bug fix: overwrite', () => {

    it ( 'a structure that became a primitive takes the incoming value', () => {
        expect ( dtbox.init({ a: { x: 1 }, k: 0 }).query ( overwrite, dtbox.init({ a: 2 }) ).copy() ).to.deep.equal ({ a: 2, k: 0 })
    })

    it ( "extend mode ('...'): new objects go to the end, the original objects stay", () => {
        const r = dtbox.init({ l: [ 1, { a: 1 } ] }).query ( overwrite, dtbox.init({ l: [ '...', { b: { deep: [ { z: 1 } ] } } ] }) );
        expect ( r.copy() ).to.deep.equal ({ l: [ 1, { a: 1 }, { b: { deep: [ { z: 1 } ] } } ] })
    })

    it ( "extend mode ('...'): a new value is not replaced by an original object at the end", () => {
        const r = dtbox.init({ l: [ 1, { a: 1 } ] }).query ( overwrite, dtbox.init({ l: [ '...', 2 ] }) );
        expect ( r.copy() ).to.deep.equal ({ l: [ 1, { a: 1 }, 2 ] })
    })
}) // describe



describe ( 'Bug fix: identical with a structure that became a primitive', () => {

    it ( 'the key is not identical, so it is absent', () => {
        const r = dtbox.init({ a: { x: 1 }, k: 0 }).query ( identical, dtbox.init({ a: 2, k: 0 }) );
        expect ( r.copy() ).to.deep.equal ({ k: 0 })
    })
}) // describe



describe ( 'missing: original keys that the update does not mention', () => {

    it ( 'returns the keys that the update does not have, with original values', () => {
        expect ( dtbox.init({ a: 12, b: 44 }).query ( missing, dtbox.init({ b: 64 }) ).copy() ).to.deep.equal ({ a: 12 })
    })

    it ( 'a key that the update has in another form is not missing', () => {
        expect ( dtbox.init({ a: 1, k: 0 }).query ( missing, dtbox.init({ a: { x: 1 } }) ).copy() ).to.deep.equal ({ k: 0 })
        expect ( dtbox.init({ a: { x: 1 }, k: 0 }).query ( missing, dtbox.init({ a: 2 }) ).copy() ).to.deep.equal ({ k: 0 })
        expect ( dtbox.init({ o: { x: 1 }, k: 0 }).query ( missing, dtbox.init({ o: [ 1 ] }) ).copy() ).to.deep.equal ({ k: 0 })
    })

    it ( 'a structure that the update does not have is missing with all its data', () => {
        expect ( dtbox.init({ o: { x: 1, d: [ 1 ] }, k: 0 }).query ( missing, dtbox.init({ k: 1 }) ).copy() ).to.deep.equal ({ o: { x: 1, d: [ 1 ] } })
    })
}) // describe



describe ( 'Bug fix: combine keeps all values', () => {

    it ( 'an object and a value become a pair [ incoming, original ]', () => {
        expect ( dtbox.init({ a: { x: 1 }, k: 0 }).query ( combine, dtbox.init({ a: 2 }) ).copy() ).to.deep.equal ({ a: [ 2, { x: 1 } ], k: 0 })
        expect ( dtbox.init({ a: 1 }).query ( combine, dtbox.init({ a: { x: { y: 1 } } }) ).copy() ).to.deep.equal ({ a: [ { x: { y: 1 } }, 1 ] })
    })

    it ( 'an object and an array become a pair [ incoming, original ]', () => {
        const r = dtbox.init({ o: { x: 1 } }).query ( combine, dtbox.init({ o: [ 5, { m: { n: 1 } } ] }) );
        expect ( r.copy() ).to.deep.equal ({ o: [ [ 5, { m: { n: 1 } } ], { x: 1 } ] })
    })

    it ( 'an array takes a value in, and its objects keep their place', () => {
        expect ( dtbox.init({ a: 1 }).query ( combine, dtbox.init({ a: [ { x: 1 }, 2 ] }) ).copy() ).to.deep.equal ({ a: [ 1, { x: 1 }, 2 ] })
        expect ( dtbox.init({ l: [ 1, 5 ] }).query ( combine, dtbox.init({ l: [ [ 7, { y: 1 } ], 5 ] }) ).copy() ).to.deep.equal ({ l: [ [ 7, { y: 1 }, 1 ], 5 ] })
    })
}) // describe



describe ( 'Bug fix: insert', () => {

    it ( 'a new value is not replaced by an original object at the end of the array', () => {
        expect ( dtbox.init({ l: [ 1, { k: 1 } ] }).query ( insert, dtbox.init({ l: [ 3 ] }) ).copy() ).to.deep.equal ({ l: [ 1, { k: 1 }, 3 ] })
    })

    it ( 'new objects in arrays and in new arrays come with their data', () => {
        expect ( dtbox.init({ l: [ 1 ] }).query ( insert, dtbox.init({ l: [ 2, { k: { d: 1 } }, 3 ] }) ).copy() ).to.deep.equal ({ l: [ 1, 2, { k: { d: 1 } }, 3 ] })
        expect ( dtbox.init({ a: 1 }).query ( insert, dtbox.init({ n: [ 1, { d: 1 } ], o: { x: 1 } }) ).copy() ).to.deep.equal ({ a: 1, n: [ 1, { d: 1 } ] })
    })

    it ( 'a changed structure is ignored', () => {
        expect ( dtbox.init({ l: [ 1 ] }).query ( insert, dtbox.init({ l: { x: 5 } }) ).copy() ).to.deep.equal ({ l: [ 1 ] })
    })
}) // describe



describe ( 'keepSegments, removeSegments: the result always has a root', () => {
    const mk = () => { const d = dtbox.init({ a: 1 }); d.insertSegment ( 's1', { b: 2 } ); d.insertSegment ( 's2', { d: 3 } ); return d };

    it ( 'more segments without the root get an empty root', () => {
        const k = mk().query ( keepSegments, [ 's1', 's2' ] );
        expect ( k.listSegments() ).to.deep.equal ([ 'root', 's1', 's2' ])
        expect ( k.copy('root') ).to.deep.equal ({})
        const r = mk().query ( removeSegments, [ 'root' ] );
        expect ( r.listSegments() ).to.deep.equal ([ 'root', 's1', 's2' ])
        expect ( r.copy('root') ).to.deep.equal ({})
    })
}) // describe



describe ( 'Bug fix: splitSegments does not lose segments', () => {

    it ( 'a root structure with the name of an existing segment stays in the root', () => {
        const dt = dtbox.init ({ o: { x: { deep: 1 } }, p: { y: 1 } });
        dt.insertSegment ( 'o', { y: 2 } )
        const r = dt.query ( splitSegments );
        expect ( r.listSegments().sort() ).to.deep.equal ([ 'o', 'p', 'root' ])
        expect ( r.copy('root') ).to.deep.equal ({ o: { x: { deep: 1 } } })
        expect ( r.copy('o') ).to.deep.equal ({ y: 2 })
        expect ( r.copy('p') ).to.deep.equal ({ y: 1 })
    })
}) // describe



describe ( 'Bug fix: updateState keeps structures of the state root', () => {
    const state = () => { const d = dtbox.init({ theme: 'dark', o: { x: 1, d: [ 1, { z: 1 } ] } }); d.insertSegment ( 'user', { name: 'Ivan' } ); return d };

    it ( 'keeps a root structure that the changes do not have', () => {
        const r = state().query ( updateState, dtbox.init({ theme: 'light' }) );
        expect ( r.copy('root') ).to.deep.equal ({ theme: 'light', o: { x: 1, d: [ 1, { z: 1 } ] } })
    })

    it ( 'takes a root structure from the changes, whole', () => {
        const r = state().query ( updateState, dtbox.init({ o: { y: [ 2 ] } }) );
        expect ( r.copy('root') ).to.deep.equal ({ theme: 'dark', o: { y: [ 2 ] } })
    })
}) // describe
