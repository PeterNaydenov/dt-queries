/**
 *  Regression tests: nested structures with repeated names.
 *
 *  Data like `{ a: { tags }, b: { tags } }` has two dt-lines named `tags`, and
 *  nested arrays repeat the names '0', '1', ... on every level.
 *  The queries used `store.set ( name, ... )` + `connect`, so a second line with
 *  the same name replaced the first in the draft index: data was lost or ended
 *  at the wrong place. Now all queries set the dt-lines by path (dt-toolbox >= 8.1.0).
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
            , update
            , overwrite
            , insert
            , combine
            , keepSegments
            , joinSegments
            , splitSegments
        } from '../src/main.js'



const toModel = ( dt ) => dt.model(() => ({as:'std'}))

const
      orig = {
                  a    : { tags : { x: 1, inner: { z: 1 } } }
                , b    : { tags : { y: 2, inner: { z: 2 } } }
                , list : [ 1, 2 ]
            }
    , upd = {
                  a    : { tags : { x: 10, inner: { z: 10 } } }
                , b    : { tags : { y: 20, inner: { z: 2  } } }
                , list : [ 3 ]
            }
    ;



describe ( 'Bug fix: repeated names in nested structures', () => {

    it ( 'same: keeps both "tags" structures on their places', () => {
        const r = dtbox.init(orig).query ( same, dtbox.init(upd) );
        expect ( toModel(r) ).to.deep.equal ({
                      a    : { tags : { x: 10, inner: { z: 10 } } }
                    , b    : { tags : { y: 20, inner: { z: 2  } } }
                    , list : [ 3, 2 ]
                })
    })

    it ( 'missing: keeps both "tags" structures on their places', () => {
        const r = dtbox.init(orig).query ( missing, dtbox.init({ a: { tags: { x: 1 } }, b: { tags: { inner: {} } } }) );
        expect ( toModel(r) ).to.deep.equal ({
                      a    : { tags : { inner: { z: 1 } } }
                    , b    : { tags : { y: 2, inner: { z: 2 } } }
                    , list : [ 1, 2 ]
                })
    })

    it ( 'different: keeps both "tags" structures on their places', () => {
        const dt = dtbox.init ( orig );
        const r = dt.query ( different, dtbox.init(upd), dt.index );
        expect ( toModel(r) ).to.deep.equal ({
                      a    : { tags : { x: 10, inner: { z: 10 } } }
                    , b    : { tags : { y: 20, inner: {} } }
                    , list : [ 3 ]
                })
    })

    it ( 'add: new "tags" structures go under their own parents', () => {
        const dt = dtbox.init ({ a: { k: 1 }, b: { k: 2 } });
        const r = dt.query ( add, dtbox.init({ a: { tags: { x: 1 } }, b: { tags: { y: 2 } } }), dt.index );
        expect ( toModel(r) ).to.deep.equal ({
                      a : { k: 1, tags: { x: 1 } }
                    , b : { k: 2, tags: { y: 2 } }
                })
    })

    it ( 'add: new keys are saved in the right "tags" structure', () => {
        const dt = dtbox.init ( orig );
        const r = dt.query ( add, dtbox.init({ a: { tags: { w: 3 } }, b: { tags: { v: 4, y: 9 } }, list: [ 2, 5 ] }), dt.index );
        expect ( toModel(r) ).to.deep.equal ({
                      a    : { tags : { x: 1, w: 3, inner: { z: 1 } } }
                    , b    : { tags : { y: 2, v: 4, inner: { z: 2 } } }
                    , list : [ 1, 2, 5 ]
                })
    })

    it ( 'add: new keys with RegExp special characters do not throw', () => {
        const dt = dtbox.init ({ a: { k: 1 } });
        const r = dt.query ( add, dtbox.init({ a: { 'p(q': { x: 1 } } }), dt.index );
        expect ( toModel(r) ).to.deep.equal ({ a: { k: 1, 'p(q': { x: 1 } } })
    })
}) // describe



describe ( 'Bug fix: nested arrays and segments', () => {
    // Array items are dt-lines named by index ('0', '1', ...), so nested arrays repeat names at every level
    const nested = { list: [ [ { k: 'a' }, 2 ], [ 3, [ 4 ] ] ], o: { p: 1 } };

    it ( 'overwrite, same, insert, add: equal data returns the same data. update: no changes', () => {
        expect ( toModel(dtbox.init(nested).query ( update, dtbox.init(nested) )) ).to.deep.equal ( {} )
        const n = dtbox.init ( nested );
        expect ( toModel(n.query ( add, dtbox.init(nested), n.index )) ).to.deep.equal ( nested )
        const queries = { overwrite, same, insert };
        Object.entries ( queries ).forEach ( ([ name, fn ]) => {
                    const r = dtbox.init(nested).query ( fn, dtbox.init(nested) );
                    expect ( toModel(r), name ).to.deep.equal ( nested )
            })
    })

    it ( 'combine: incoming structure on the place of an array value does not throw', () => {
        const r = dtbox.init({ list: [ 3 ] }).query ( combine, dtbox.init({ list: [ { k: 1 } ] }) );
        expect ( toModel(r) ).to.deep.equal ({ list: [ [ { k: 1 }, 3 ] ] })
    })

    it ( 'keepSegments: a single nested segment keeps its structure', () => {
        const dt = dtbox.init ({ a: 1 });
        dt.insertSegment ( 'seg', { b: { c: { d: 1 } }, list: [ { e: 2 } ] } )
        const r = dt.query ( keepSegments, [ 'seg' ] );
        expect ( toModel(r) ).to.deep.equal ({ b: { c: { d: 1 } }, list: [ { e: 2 } ] })
    })

    it ( 'joinSegments: structures of the root stay in the root', () => {
        const dt = dtbox.init ({ a: 1, o: { p: 1 } });
        dt.insertSegment ( 'seg', { q: { r: 1 } } )
        const r = dt.query ( joinSegments );
        expect ( r.listSegments() ).to.deep.equal ([ 'root' ])
        expect ( r.copy() ).to.deep.equal ({ a: 1, o: { p: 1 }, seg: { q: { r: 1 } } })
    })

    it ( 'splitSegments: nested arrays keep their data', () => {
        const r = dtbox.init(nested).query ( splitSegments );
        expect ( r.listSegments() ).to.deep.equal ([ 'root', 'list', 'o' ])
        expect ( r.copy('list') ).to.deep.equal ( nested.list )
    })
}) // describe



describe ( 'Bug fix: arrays with objects and primitives', () => {
    // An object item of an array is a separate dt-line, placed by index.
    // Queries that removed values before it moved it over another value.
    const mixed = { list: [ 3, { k: 1 }, 'a' ] };

    it ( 'missing, change: equal arrays keep only the object items. different: the object item keeps its place', () => {
        expect ( toModel(dtbox.init(mixed).query ( missing, dtbox.init(mixed) )) ).to.deep.equal ({ list: [ {} ] })
        expect ( toModel(dtbox.init(mixed).query ( change , dtbox.init(mixed) )) ).to.deep.equal ({ list: [ {} ] })
        const dt = dtbox.init ( mixed );
        expect ( dt.query ( different, dtbox.init(mixed), dt.index ).copy() ).to.deep.equal ({ list: [ undefined, {} ] })
    })

    it ( 'missing: object items move with their deep structure', () => {
        const r = dtbox.init({ list: [ 3, { k: { deep: [ 1, { z: 1 } ] } }, 'a' ] })
                       .query ( missing, dtbox.init({ list: [ 'x', { k: { deep: [ 1 ] } }, 2 ] }) );
        expect ( toModel(r) ).to.deep.equal ({ list: [ 3, { k: { deep: [ { z: 1 } ] } }, 'a' ] })
    })

    it ( 'missing: works the same with a dt-object loaded from a JSON dt-model', () => {
        const loaded = dtbox.load ( JSON.parse ( JSON.stringify ( dtbox.init(mixed).export() ) ) );   // Object places are `null`, not empty
        expect ( toModel(loaded.query ( missing, dtbox.init(mixed) )) ).to.deep.equal ({ list: [ {} ] })
    })

    it ( 'identical: keeps equal values and the object items on their new places', () => {
        expect ( toModel(dtbox.init(mixed).query ( identical, dtbox.init(mixed) )) ).to.deep.equal ( mixed )
        const r = dtbox.init(mixed).query ( identical, dtbox.init({ list: [ 4, { k: 1 }, 'a' ] }) );
        expect ( toModel(r) ).to.deep.equal ({ list: [ { k: 1 }, 'a' ] })
    })

    it ( 'combine: keeps the place of object items', () => {
        const r = dtbox.init(mixed).query ( combine, dtbox.init({ list: [ 5 ] }) );
        expect ( toModel(r) ).to.deep.equal ({ list: [ 3, { k: 1 }, 'a', 5 ] })
    })

    it ( 'combine: new incoming object items go to the end', () => {
        const r = dtbox.init({ list: [ 3 ] }).query ( combine, dtbox.init({ list: [ 5, { k: 1 } ] }) );
        expect ( toModel(r) ).to.deep.equal ({ list: [ 3, 5, { k: 1 } ] })
    })
}) // describe



describe ( 'Bug fix: arrays taken from the update', () => {
    // When a query takes an array from the update, the array comes whole: values, objects and their deep structure.
    // Before the fix, only the values came from the update and the objects stayed from the original.

    it ( 'change, overwrite: incoming values are not replaced by original objects', () => {
        const queries = { change, overwrite };
        Object.entries ( queries ).forEach ( ([ name, fn ]) => {
                    const r = dtbox.init({ list: [ { a: 1 } ] }).query ( fn, dtbox.init({ list: [ 7, 8 ] }) );
                    expect ( toModel(r), name ).to.deep.equal ({ list: [ 7, 8 ] })
            })
    })

    it ( 'change, overwrite: incoming objects come with their deep structure', () => {
        const 
              queries = { change, overwrite }
            , incoming = { list: [ { b: { deep: [ { y: 2 } ] } }, 3 ] }
            ;
        Object.entries ( queries ).forEach ( ([ name, fn ]) => {
                    const r = dtbox.init({ list: [ { a: { deep: [ 1, { z: 1 } ] } } ] }).query ( fn, dtbox.init(incoming) );
                    expect ( toModel(r), name ).to.deep.equal ( incoming )
            })
    })

    it ( 'overwrite: a shorter incoming array drops the original objects', () => {
        const queries = { overwrite };
        Object.entries ( queries ).forEach ( ([ name, fn ]) => {
                    const r = dtbox.init({ list: [ 1, { a: 1 } ] }).query ( fn, dtbox.init({ list: [ 5 ] }) );
                    expect ( toModel(r), name ).to.deep.equal ({ list: [ 5 ] })
            })
    })

    it ( 'change, overwrite: a changed structure comes with its children', () => {
        const queries = { change, overwrite };
        Object.entries ( queries ).forEach ( ([ name, fn ]) => {
                    const r = dtbox.init({ o: [ 1, { k: 1 } ] }).query ( fn, dtbox.init({ o: { a: { x: 1 } } }) );
                    expect ( toModel(r), name ).to.deep.equal ({ o: { a: { x: 1 } } })
            })
    })

}) // describe



describe ( 'same: original structure, primitive values from the update', () => {

    it ( 'keeps keys and structures that the update does not have', () => {
        const r = dtbox.init({ a: 1, b: 2, o: { x: 1 } }).query ( same, dtbox.init({ a: 10 }) );
        expect ( r.copy() ).to.deep.equal ({ a: 10, b: 2, o: { x: 1 } })
    })

    it ( 'does not apply new keys and structures of the update', () => {
        const r = dtbox.init({ a: 1 }).query ( same, dtbox.init({ a: 2, n: 3, o: { x: 1 } }) );
        expect ( r.copy() ).to.deep.equal ({ a: 2 })
    })

    it ( 'keeps the array length and takes values on the same place', () => {
        expect ( dtbox.init({ l: [ 1, { k: 1 }, 3 ] }).query ( same, dtbox.init({ l: [ 9 ] }) ).copy() ).to.deep.equal ({ l: [ 9, { k: 1 }, 3 ] })
        expect ( dtbox.init({ l: [ 1 ] }).query ( same, dtbox.init({ l: [ 5, 6 ] }) ).copy() ).to.deep.equal ({ l: [ 5 ] })
    })

    it ( 'keeps the original on a changed structure', () => {
        expect ( dtbox.init({ o: [ 1, { k: 1 } ] }).query ( same, dtbox.init({ o: { a: 1 } }) ).copy() ).to.deep.equal ({ o: [ 1, { k: 1 } ] })
        expect ( dtbox.init({ a: 1 }).query ( same, dtbox.init({ a: { x: 1 } }) ).copy() ).to.deep.equal ({ a: 1 })
        expect ( dtbox.init({ a: { x: 1 } }).query ( same, dtbox.init({ a: 2 }) ).copy() ).to.deep.equal ({ a: { x: 1 } })
    })

    it ( 'takes values of objects inside arrays from the same place', () => {
        const r = dtbox.init({ l: [ { k: 1, m: 1 }, 2 ] }).query ( same, dtbox.init({ l: [ { k: 5, n: 6 }, 7 ] }) );
        expect ( r.copy() ).to.deep.equal ({ l: [ { k: 5, m: 1 }, 7 ] })
    })
}) // describe



describe ( 'update: which original keys are changed, and how', () => {
    const show = r => r.copy ();

    it ( 'shows only changed keys of the original. New keys are ignored', () => {
        expect ( show(dtbox.init({ a: 1, b: 2 }).query ( update, dtbox.init({ a: 5, c: 3 }) )) ).to.deep.equal ({ a: 5 })
        expect ( show(dtbox.init({ a: 1 }).query ( update, dtbox.init({ a: 1 }) )) ).to.deep.equal ({})
    })

    it ( 'arrays: a change keeps its place', () => {
        expect ( show(dtbox.init({ l: [ 1, { k: 1 } ] }).query ( update, dtbox.init({ l: [ 7, { m: 2 } ] }) )) ).to.deep.equal ({ l: [ 7 ] })
        const r = show ( dtbox.init({ l: [ 0, 1, 2, 3 ] }).query ( update, dtbox.init({ l: [ 0, 1, 2, 9 ] }) ) );
        expect ( r.l ).to.have.length ( 4 )
        expect ( r.l[3] ).to.equal ( 9 )
        expect ( r.l.slice(0,3).every ( x => x === undefined ) ).to.be.true
    })

    it ( 'arrays: a changed object keeps its place', () => {
        const r = show ( dtbox.init({ l: [ 1, { k: 1 } ] }).query ( update, dtbox.init({ l: [ 1, { k: 5 } ] }) ) );
        expect ( r.l[0] ).to.be.undefined
        expect ( r.l[1] ).to.deep.equal ({ k: 5 })
    })

    it ( 'a value that became a structure shows just the new structure', () => {
        expect ( show(dtbox.init({ a: 1 }).query ( update, dtbox.init({ a: { x: 1 } }) )) ).to.deep.equal ({ a: {} })
        expect ( show(dtbox.init({ o: { x: 1 } }).query ( update, dtbox.init({ o: [ 1 ] }) )) ).to.deep.equal ({ o: [] })
        expect ( show(dtbox.init({ l: [ 1 ] }).query ( update, dtbox.init({ l: [ { x: 1 } ] }) )) ).to.deep.equal ({ l: [ {} ] })
    })

    it ( 'a structure that became a value shows the value', () => {
        expect ( show(dtbox.init({ a: { x: 1 } }).query ( update, dtbox.init({ a: 2 }) )) ).to.deep.equal ({ a: 2 })
        expect ( show(dtbox.init({ l: [ { k: 1 } ] }).query ( update, dtbox.init({ l: [ 5 ] }) )) ).to.deep.equal ({ l: [ 5 ] })
    })
}) // describe



describe ( 'add: keep the original, add only new data', () => {
    const run = ( original, incoming ) => { const dt = dtbox.init ( original ); return dt.query ( add, dtbox.init(incoming), dt.index ).copy () };

    it ( 'adds new keys, existing keys keep the original value', () => {
        expect ( run ({ a: 1, b: 2 }, { a: 5, c: 3 }) ).to.deep.equal ({ a: 1, b: 2, c: 3 })
        expect ( run ({ o: { x: 1 } }, { o: { y: { z: [ 1, { w: 1 } ] } } }) ).to.deep.equal ({ o: { x: 1, y: { z: [ 1, { w: 1 } ] } } })
    })

    it ( 'a changed structure keeps the original, and does not throw', () => {
        expect ( run ({ o: { x: 1 } }, { o: [ 5 ] }) ).to.deep.equal ({ o: { x: 1 } })
        expect ( run ({ a: 1 }, { a: { x: 1 } }) ).to.deep.equal ({ a: 1 })
        expect ( run ({ a: { x: 1 } }, { a: 2 }) ).to.deep.equal ({ a: { x: 1 } })
    })

    it ( 'arrays: new values and objects go to the end, original objects keep their place', () => {
        expect ( run ({ l: [ 1, { k: 1 } ] }, { l: [ 3 ] }) ).to.deep.equal ({ l: [ 1, { k: 1 }, 3 ] })
        expect ( run ({ l: [ 1 ] }, { l: [ 2, { k: 1 }, 3 ] }) ).to.deep.equal ({ l: [ 1, 2, { k: 1 }, 3 ] })
        expect ( run ({ l: [ { k: 1 } ] }, { l: [ { k: 9, m: 2 } ] }) ).to.deep.equal ({ l: [ { k: 1, m: 2 } ] })
    })
}) // describe



describe ( 'different: new and changed values on their place', () => {
    const run = ( original, incoming ) => { const dt = dtbox.init ( original ); return dt.query ( different, dtbox.init(incoming), dt.index ).copy () };

    it ( 'arrays: a changed or new value keeps its index', () => {
        expect ( run ({ l: [ 1, 2 ] }, { l: [ 1, 3 ] }) ).to.deep.equal ({ l: [ undefined, 3 ] })
        expect ( run ({ l: [ 1, 2, 3 ] }, { l: [ 1, 2, 3, 4 ] }) ).to.deep.equal ({ l: [ undefined, undefined, undefined, 4 ] })
    })

    it ( 'arrays: object items keep their index', () => {
        expect ( run ({ l: [ 1, { k: 1 } ] }, { l: [ 1, { k: 5 } ] }) ).to.deep.equal ({ l: [ undefined, { k: 5 } ] })
        expect ( run ({ l: [ 1 ] }, { l: [ 1, { k: 1 } ] }) ).to.deep.equal ({ l: [ undefined, { k: 1 } ] })
    })

    it ( 'a structure without differences is empty', () => {
        expect ( run ({ o: { x: 1, y: 2 } }, { o: { x: 1 } }) ).to.deep.equal ({ o: {} })
    })
}) // describe
