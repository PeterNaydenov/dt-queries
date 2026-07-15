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
