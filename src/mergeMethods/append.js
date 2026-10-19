'use strict'
/**
 *   Append: Keep only original keys and change value if incoming data has same key. New value is appended.
 *    - use all data structures from the original;
 *    - combine original and incoming values for equal keys;
 *    - if original data structure was changed, ignore that change;
 *    - arrays - Extend existing array with the new values. Objects and arrays in the array keep their place;
 */

import arrayLength from '../helpers/arrayLength.js'



function append ( storage, inData ) {
    storage.look ( ({ flatData, breadcrumbs, links, next }) => {
                const 
                      inRow = inData.index(breadcrumbs)
                    , isArray = flatData instanceof Array
                    ;

                if ( !inRow ) { //
                            storage.set ( breadcrumbs, flatData )
                            return next ()
                    }

                const
                      [ , inFlat, , inEdges ] = inRow
                    , inIsArray = inFlat instanceof Array
                    ;
                
                if ( isArray != inIsArray ) {   // Structure was changed: keep the original
                            storage.set ( breadcrumbs, flatData )
                    }
                else if ( isArray ) {
                            const
                                  items   = new Set ( links.map ( ([,child]) => +child ) )   // Indexes of items with own dt-lines (objects, arrays)
                                , inItems = new Set ( inEdges.map ( br => +br.slice ( br.lastIndexOf('/') + 1 ) ) )
                                , length  = arrayLength ( flatData, items )
                                , arr = []
                                , has = new Set ()
                                ;
                            for ( let i = 0; i < length; i++ ) {
                                        if ( items.has(i) || !(i in flatData) ) {   // Keep the place of the item
                                                    arr.push ( null )
                                                    continue
                                            }
                                        arr.push ( flatData[i] )
                                        has.add ( flatData[i] )
                                }
                            inFlat.forEach ( (v,i) => {   // New values go to the end
                                            if ( inItems.has(i) || has.has(v) )   return
                                            arr.push ( v )
                                            has.add ( v )
                                    })
                            storage.set ( breadcrumbs, arr )
                    }
                else {
                            const 
                                  entries = Object.entries ( flatData )
                                , obj = {}
                                ;
                            entries.forEach ( ([k,v]) => {
                                        if ( inFlat.hasOwnProperty(k) )   obj[k] = `${v},${inFlat[k]}`
                                        else                              obj[k] = v
                                    })
                            storage.set ( breadcrumbs, obj )
                    }
                return next ()
        }) // look storage
} // append func.



export default append


