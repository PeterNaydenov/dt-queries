'use strict'
/**
 *   Overwrite: Update + add new structures and key/values
 *    - use all data structures from the original;
 *    - take values and new structures from incoming data;
 *    - if original data structure was changed, use the incoming structure;
 *    - arrays - incoming array starts with '...' -> extend existing array with new values;
 *    - arrays - first element is not '...' -> overwrite the array
 *    - overwritten arrays and changed structures come with their incoming objects and arrays;
 *    - extended arrays keep their original items. New incoming objects and arrays go to the end;
 *    - a structure that became a primitive takes the incoming value;
 */

import pathMap     from '../helpers/pathMap.js'
import arrayLength from '../helpers/arrayLength.js'
import isStructure from '../helpers/isStructure.js'


function overwrite ( storage, inData ) {
    const 
          crumbs   = new Set ()
        , replaced = new Set ()   // Structures taken from the incoming data. Their original children are skipped, the incoming ones are added below
        , extended = new Set ()   // Arrays extended with '...'. Their original items keep the original data
        , kept     = new Set ()   // dt-lines inside the original items of extended arrays
        , paths    = pathMap ()   // Incoming items of extended arrays go to the end of the array
        ;
    storage.look ( ({ flatData, breadcrumbs, links, next }) => {
                const 
                      cut    = breadcrumbs.lastIndexOf ( '/' )
                    , parent = cut > 0 ? breadcrumbs.slice ( 0, cut ) : null
                    ;
                if ( parent && replaced.has(parent) ) {
                            replaced.add ( breadcrumbs )
                            return next ()
                    }
                if ( parent && ( extended.has(parent) || kept.has(parent) ) ) {   // Inside an item of an extended array
                            kept.add ( breadcrumbs )
                            crumbs.add ( breadcrumbs )
                            storage.set ( breadcrumbs, flatData )
                            return next ()
                    }
                const 
                      inRow = inData.index(breadcrumbs)
                    , isArray = flatData instanceof Array
                    ;
                if ( inRow && !isStructure(inRow[1]) ) {   // The structure became a primitive. The parent has the incoming value
                            replaced.add ( breadcrumbs )
                            return next ()
                    }
                crumbs.add ( breadcrumbs )
                if ( !inRow ) { //
                            storage.set ( breadcrumbs, flatData )
                            return next ()
                    }
                const
                      [ , inFlat, , inEdges ] = inRow
                    , inIsArray = inFlat instanceof Array
                    ;
                if ( isArray !== inIsArray ) {   // If change in data-structure
                            storage.set ( breadcrumbs, inFlat )
                            replaced.add ( breadcrumbs )
                    }
                else if ( isArray ) {  // If both are arrays
                            if ( inFlat[0] == '...' ) { // if first element of incoming array is empty -> extend the existing array.
                                        const
                                              items    = new Set ( links.map ( ([,child]) => +child ) )   // Indexes of items with own dt-lines (objects, arrays)
                                            , inItems  = new Set ( inEdges.map ( br => +br.slice ( br.lastIndexOf('/') + 1 ) ) )
                                            , length   = arrayLength ( flatData, items )
                                            , inLength = arrayLength ( inFlat, inItems )
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
                                        for ( let i = 0; i < inLength; i++ ) {
                                                    if ( inItems.has(i) ) {   // A new item goes to the end
                                                                paths.move ( breadcrumbs, i, arr.length )
                                                                arr.push ( null )
                                                                continue
                                                        }
                                                    if ( !(i in inFlat) )   continue
                                                    const el = inFlat[i];
                                                    if ( el == '...' || has.has(el) )   continue
                                                    arr.push ( el )
                                                    has.add ( el )
                                            }
                                        storage.set ( breadcrumbs, arr )
                                        extended.add ( breadcrumbs )
                                }
                            else {     // Overwrite the array
                                        storage.set ( breadcrumbs, inFlat )
                                        replaced.add ( breadcrumbs )
                                }
                    }
                else {   // objects. Set key/values
                            let 
                                  obj = { ... flatData }
                                , inEntries = Object.entries( inFlat )
                                ;
                            inEntries.forEach ( ([k,v]) =>  obj[k] = v   )
                            storage.set ( breadcrumbs, obj )
                    }
                return next ()
        }) // look storage

    inData.query ( inStorage => {   // Fulfill the new structures from incoming data
                    inStorage.look (({ flatData, breadcrumbs, next }) => {
                                    const path = paths.path ( breadcrumbs );
                                    if ( path !== breadcrumbs ) {   // An incoming item of an extended array, or inside it
                                                storage.set ( path, flatData )
                                                return next ()
                                        }
                                    if ( !crumbs.has(breadcrumbs) ) {
                                                const cut = breadcrumbs.lastIndexOf ( '/' );
                                                if ( cut > 0 && !crumbs.has(breadcrumbs.slice(0,cut)) )   return next ()   // Parent is not in the result
                                                storage.set ( breadcrumbs, flatData )
                                                crumbs.add ( breadcrumbs )
                                        }
                                    return next ()
                            }) // look inStorage
        }) // query inData
} // overwrite func.



export default overwrite


