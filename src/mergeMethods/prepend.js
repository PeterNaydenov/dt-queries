'use strict'
/**
 *   Prepend: Keep only original keys and change value if incoming data has same key. New value is prepended.
 *    - use all data structures from the original;
 *    - combine incoming and original values for equal keys;
 *    - if original data structure was changed, ignore that change;
 *    - arrays - New values go at the start of the existing array. Objects and arrays in the array keep their order;
 */

import pathMap     from '../helpers/pathMap.js'
import arrayLength from '../helpers/arrayLength.js'



function prepend ( storage, inData ) {
    const paths = pathMap ();   // Items of the original array move after the new values
    storage.look ( ({ flatData, breadcrumbs, links, next }) => {
                const 
                      inRow = inData.index(breadcrumbs)
                    , isArray = flatData instanceof Array
                    , path = paths.path ( breadcrumbs )
                    ;

                if ( !inRow ) { //
                            storage.set ( path, flatData )
                            return next ()
                    }

                const
                      [ , inFlat, , inEdges ] = inRow
                    , inIsArray = inFlat instanceof Array
                    ;
                
                if ( isArray != inIsArray ) {   // Structure was changed: keep the original
                            storage.set ( path, flatData )
                    }
                else if ( isArray ) {
                            const
                                  items   = new Set ( links.map ( ([,child]) => +child ) )   // Indexes of items with own dt-lines (objects, arrays)
                                , inItems = new Set ( inEdges.map ( br => +br.slice ( br.lastIndexOf('/') + 1 ) ) )
                                , length  = arrayLength ( flatData, items )
                                , orig = []
                                , has  = new Set ()
                                , news = []
                                ;
                            for ( let i = 0; i < length; i++ ) {
                                        if ( items.has(i) || !(i in flatData) ) {   // Keep the place of the item
                                                    orig.push ( null )
                                                    continue
                                            }
                                        orig.push ( flatData[i] )
                                        has.add ( flatData[i] )
                                }
                            inFlat.forEach ( (v,i) => {
                                            if ( inItems.has(i) || has.has(v) )   return
                                            news.push ( v )
                                            has.add ( v )
                                    })
                            items.forEach ( i => paths.move ( breadcrumbs, i, i + news.length ) )
                            storage.set ( path, [ ...news, ...orig ] )
                    }
                else {
                            const 
                                  entries = Object.entries ( flatData )
                                , obj = {}
                                ;
                            entries.forEach ( ([k,v]) => {
                                        if ( inFlat.hasOwnProperty(k) )   obj[k] = `${inFlat[k]},${v}`
                                        else                              obj[k] = v
                                    })
                            storage.set ( path, obj )
                    }
                return next ()
        }) // look storage
} // prepend func.



export default prepend


