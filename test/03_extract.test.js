/**
 *  Testing extraction operations
 * 
 */



import { expect } from "chai"
import dtbox from "dt-toolbox"
import { keepSegments, removeSegments } from '../src/main.js'




const 
        a = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                                age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            }
        ;



describe ( 'Segment operations', () => {



it ( 'keepSegments: Single segment', () => {   
    const 
          dt = dtbox.init ( a )
        , extraData = dtbox.init({ name: 'John', age: 33, more: { title:'More', num: 12 } })
        ;
    dt.insertSegment ( 'extraData', extraData );
    const 
          mixed = dt.query ( keepSegments, ['extraData'] )
        , result = mixed.model(() =>({as:'std'}))
        ;
    expect ( result ).to.deep.equal ( { name: 'John', age: 33, more: { title:'More', num: 12 } } )
}) // it keepSegments, single segment



it ( 'keepSegments: No segments', () => {
    const 
          dt = dtbox.init ( a )
        , extraData = dtbox.init({ name: 'John', age: 33, more: { title:'More', num: 12 } })
        ;
    dt.insertSegment ( 'extraData', extraData )
    const  
           mixed = dt.query ( keepSegments )
         , result = mixed.model(() =>({as:'std'}))
         ;
    expect ( result ).to.deep.equal ( {} )
}) // it keepSegments, no segments



it ( 'keepSegments: Multiple segments', () => {
    const 
          dt = dtbox.init ( a )
        , extraData = dtbox.init({ name: 'John', age: 33, more: { title:'More', num: 12 } })
        ;
    dt.insertSegment ( 'extraData', extraData )
    const  
           mixed = dt.query ( keepSegments, [ 'root', 'extraData'] )
         , result = mixed.export ()
         ;
    let count = 0;
    result.forEach ( ([name,flatData,breadcrumbs]) => {
                if ( name !== breadcrumbs ) return
                count++
        })
    expect ( count ).to.equal ( 2 )
}) // it keepSegments, multiple segments



it ( 'removeSegments: Single segment', () => {
    const 
          dt = dtbox.init ( a )
        , extraData = dtbox.init({ name: 'John', age: 33, more: { title:'More', num: 12 } })
        ;
    dt.insertSegment ( 'extraData', extraData )
    const  
           mixed = dt.query ( removeSegments, [ 'root'] )
         , result = mixed.model(() =>({as:'std'}))
         ;
    expect ( result ).to.be.deep.equal ( { name: 'John', age: 33, more: { title:'More', num: 12 } }  )
}) // it removeSegments, single segment



it ( 'removeSegments: No segments', () => {
    const 
          dt = dtbox.init ( a )
        , extraData = dtbox.init({ name: 'John', age: 33, more: { title:'More', num: 12 } })
        ;
    dt.insertSegment ( 'extraData', extraData )
    const  
           mixed = dt.query ( removeSegments, [ 'root', 'extraData'] )
         , result = mixed.model(() =>({as:'std'}))
         ;
    expect ( result ).to.deep.equal ( {} )
}) // it removeSegments, no segments



it ( 'removeSegments: Multiple segments', () => {
    const 
          dt = dtbox.init ( a )
        , extraData = dtbox.init({ name: 'John', age: 33, more: { title:'More', num: 12 } })
        ;
    dt.insertSegment ( 'extraData', extraData )
    const  
           mixed = dt.query ( removeSegments )
         , result = mixed.export ()
         ;
    let count = 0;
    result.forEach ( ([name,flatData,breadcrumbs]) => {
                if ( name !== breadcrumbs ) return
                count++
        })
    expect ( count ).to.equal ( 2 )
}) // it removeSegments, multiple segments



}) // describe 
