'use strict'
/**
 *   Combine: Preserve all values from incoming and original data
 *    - use all data structures from the incoming data;
 *    - combine original and incoming values into arrays;
 *    - incoming data structure has a priority;
 *    - arrays extend existing array with incoming values;
 *    - arrays: items with own dt-lines (objects, arrays) keep their place. New incoming items go to the end;
 *    - equal keys become a pair [ incoming, original ]. Also an object and a value, or an object and an array. An array and a value: the value goes into the array;
 */


import pathMap     from '../helpers/pathMap.js'
import arrayLength from '../helpers/arrayLength.js'
import isStructure from '../helpers/isStructure.js'
import copySubtree from '../helpers/copySubtree.js'



function combine ( storage, inData ) {
    const 
          crumbs  = new Set ()
        , paths   = pathMap ()   // New incoming array items go to the end of the array. Paired structures go one level deeper
        , kept    = new Set ()   // Original structures in a pair: they keep their data
        , handled = new Set ()   // Incoming structures in a pair: already in the result
        ;
    storage.look ( ({ flatData, breadcrumbs, links, next }) => {
                let inRow;
                const 
                      isArray = flatData instanceof Array
                    , cut     = breadcrumbs.lastIndexOf ( '/' )
                    ;
                crumbs.add ( breadcrumbs )

                if ( cut > 0 && kept.has(breadcrumbs.slice(0,cut)) ) {   // Inside an original structure of a pair
                            kept.add ( breadcrumbs )
                            storage.set ( paths.path ( breadcrumbs ), flatData )
                            return next ()
                    }
                inRow = inData.index ( breadcrumbs )
                const pair = inRow && ( isStructure(inRow[1]) ? (inRow[1] instanceof Array) !== isArray : !isArray );   // Object and value, or object <-> array. An array takes a value in
                if ( pair ) {   // Pair [ incoming, original ]
                            const path = paths.path ( breadcrumbs );
                            if ( isStructure(inRow[1]) ) {
                                        storage.set ( path, [ null, null ] )
                                        storage.set ( `${path}/0`, inRow[1] )
                                        copySubtree ( storage, inData, breadcrumbs, `${path}/0` )
                                        handled.add ( breadcrumbs )
                                }
                            else    storage.set ( path, [ inRow[1], null ] )
                            paths.rename ( breadcrumbs, `${path}/1` )
                            storage.set ( `${path}/1`, flatData )
                            kept.add ( breadcrumbs )
                            return next ()
                    }

                if ( isArray ) {
                            const
                                  arr    = []
                                , has    = new Set ()   // Values in `arr`, without the places of items
                                , extras = []   // Set after the array, so the array is their parent
                                , items  = new Set ( links.map ( ([,child]) => +child ) )   // Indexes of items with own dt-lines (objects, arrays)
                                , length = arrayLength ( flatData, items )
                                ;
                            for ( let i = 0; i < length; i++ ) {
                                        if ( items.has(i) || !(i in flatData) ) {   // Keep the place of the item
                                                    arr.push ( null )
                                                    continue
                                            }
                                        const
                                              el = flatData[i]
                                            , checkIndex = `${breadcrumbs}/${i}`
                                            , extraRow = inData.index( checkIndex )   // Check for extra incoming structures
                                            ;
                                        if ( !extraRow ) {
                                                    arr.push ( el )
                                                    has.add ( el )
                                                    continue
                                            }
                                        const [ , extraFlat, , extraEdges ] = extraRow;
                                        if ( extraFlat instanceof Array ) {   // The incoming array takes the value in: [ ...incoming array, original value ]
                                                    const
                                                          exItems  = new Set ( extraEdges.map ( br => +br.slice ( br.lastIndexOf('/') + 1 ) ) )
                                                        , exLength = arrayLength ( extraFlat, exItems )
                                                        , l = []
                                                        ;
                                                    for ( let j = 0; j < exLength; j++ )   l.push ( exItems.has(j) ? null : extraFlat[j] )   // Incoming items keep their place
                                                    l.push ( el )
                                                    extras.push ( () => storage.set ( checkIndex, l ) )
                                            }
                                        else  extras.push ( () => {   // Pair [ incoming object, original value ]
                                                    storage.set ( checkIndex, [ null, el ] )
                                                    storage.set ( `${checkIndex}/0`, extraFlat )
                                                    paths.rename ( checkIndex, `${checkIndex}/0` )   // Incoming children go under the pair item
                                            })
                                        arr.push ( null )   // Place of the combined structure
                                        crumbs.add ( checkIndex )
                                }
                            if ( !inRow ) {   // A value of the incoming parent on this place is combined by the parent
                                        storage.set ( breadcrumbs, arr )
                                }
                            else {
                                    const [ , inFlat, , inEdges ] = inRow;
                                    if ( inFlat instanceof Array ) {
                                                const 
                                                      inItems  = new Set ( inEdges.map ( br => +br.slice ( br.lastIndexOf('/') + 1 ) ) )
                                                    , inLength = arrayLength ( inFlat, inItems )
                                                    ;
                                                for ( let i = 0; i < inLength; i++ ) {
                                                            if ( inItems.has(i) ) {
                                                                        if ( i < length )   continue   // Combined with the original data on this place
                                                                        paths.move ( breadcrumbs, i, arr.length )   // A new item goes to the end
                                                                        arr.push ( null )
                                                                        continue
                                                                }
                                                            if ( !(i in inFlat) )   continue
                                                            const el = inFlat[i];
                                                            if ( has.has(el) )   continue
                                                            arr.push ( el )
                                                            has.add ( el )
                                                    }
                                                storage.set ( breadcrumbs, arr )
                                        }
                                    else {
                                                arr.push ( inFlat )
                                                storage.set ( breadcrumbs, arr )
                                        }
                                }
                            extras.forEach ( setExtra => setExtra () )
                            return next ()
                    } // if isArray


                let 
                      entries = Object.entries ( flatData )
                    , entryKeys = new Set ( Object.keys ( flatData ) )
                    ;
                storage.set ( breadcrumbs, {})
                const updateObject = ( inRow && inRow[1] && typeof inRow[1] === 'object' ) ? inRow[1] : null;   // Incoming data may not have this object
                entries.forEach ( ([k,v]) => {
                                const
                                      checkKey = `${breadcrumbs}/${k}`
                                    , extraData = inData.index ( checkKey )
                                    ;
                                if ( !extraData ) {
                                            const update = updateObject ? updateObject[k] : undefined;
                                            if ( update ) {
                                                        storage.set ( checkKey, [ v, update ])
                                                        crumbs.add ( checkKey )
                                                }
                                            else {
                                                        storage.save ( breadcrumbs, k , v )
                                                }
                                    }
                                else {
                                            const exData = extraData[1];
                                            if ( exData instanceof Array ) {   // The array takes the value in: [ original value, ...incoming array ]
                                                        const
                                                              exItems  = new Set ( extraData[3].map ( br => +br.slice ( br.lastIndexOf('/') + 1 ) ) )
                                                            , exLength = arrayLength ( exData, exItems )
                                                            , l = [ v ]
                                                            ;
                                                        for ( let i = 0; i < exLength; i++ ) {
                                                                    if ( exItems.has(i) ) {   // Incoming items move after the original value
                                                                                paths.move ( checkKey, i, i + 1 )
                                                                                l.push ( null )
                                                                        }
                                                                    else  l.push ( exData[i] )
                                                            }
                                                        storage.set ( checkKey, l )
                                                }
                                            else if ( isStructure(exData) ) {   // Pair [ incoming object, original value ]
                                                        storage.set ( checkKey, [ null, v ] )
                                                        storage.set ( `${checkKey}/0`, exData )
                                                        paths.rename ( checkKey, `${checkKey}/0` )   // Incoming children go under the pair item
                                                }
                                            else {   // Pair of values
                                                        storage.set ( checkKey, [ exData, v ] )
                                                }
                                            crumbs.add ( checkKey )
                                    }
                    })
                // Fulfill key/values that only incoming objects has
                if ( updateObject ) {   // The incoming dt-line with the same breadcrumbs
                                const 
                                      linkProps = new Set ( links.map ( ([,child]) => child ) )
                                    , saveNew = ( value, key ) => {
                                                    if ( linkProps.has(key) )   return
                                                    if ( !entryKeys.has(key) )   storage.save ( breadcrumbs, key, value )
                                            }
                                    ;
                                if ( updateObject instanceof Array )   updateObject.forEach ( saveNew )
                                else                                   Object.keys ( updateObject ).forEach ( key => saveNew ( updateObject[key], key ) )
                    }
                return next ()
        }) // look storage

    inData.query ( inStorage => {   // Fulfill the new structures from incoming data
                    inStorage.look (({ flatData, breadcrumbs, next }) => {
                                    const cut = breadcrumbs.lastIndexOf ( '/' );
                                    if ( cut > 0 && handled.has(breadcrumbs.slice(0,cut)) ) {   // Inside an incoming structure of a pair
                                                handled.add ( breadcrumbs )
                                                return next ()
                                        }
                                    if ( crumbs.has(breadcrumbs) )   return next ()
                                    if ( cut > 0 && !crumbs.has(breadcrumbs.slice(0,cut)) )   return next ()   // Parent is not in the result
                                    storage.set ( paths.path ( breadcrumbs ), flatData )
                                    crumbs.add ( breadcrumbs )
                                    return next ()
                            }) // look inStorage
        }) // query inData
} // combine func.



export default combine


