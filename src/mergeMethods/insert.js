'use strict'
/**
 *   Insert: Extend available array structures only
 *    - use all data structures from the original. Objects keep their data;
 *    - arrays - Extend existing array with the new values. New incoming objects and arrays in the array go to the end,
 *      an object (or array) on the place of an original one of the same type is extended the same way;
 *    - add new arrays if any, with their data;
 *    - if original data structure was changed, ignore it;
 */

import pathMap     from '../helpers/pathMap.js'
import arrayLength from '../helpers/arrayLength.js'
import isStructure from '../helpers/isStructure.js'



const
      childKey = br => br.slice ( br.lastIndexOf('/') + 1 )
    , sameKind = ( a, b ) => isStructure(a) && isStructure(b) && (a instanceof Array) === (b instanceof Array)
    ;



function insert ( storage, inData ) {
    const
          original = new Map ()   // Breadcrumbs -> [ flatData, links ] of the original dt-lines
        , kept     = new Set ()   // Original dt-lines without a matching incoming structure: they stay as they are
        , merged   = new Set ()   // Original dt-lines with a matching incoming structure
        , newItems = new Set ()   // Incoming array items that go to the end of the original array
        , added    = new Set ()   // Incoming dt-lines in the result
        , paths    = pathMap ()
        ;
    storage.look ( ({ flatData, breadcrumbs, links, next }) => {   // Array items need the type of the original items first
                original.set ( breadcrumbs, [ flatData, links ] )
                return next ()
        })

    // The original data, with the new array values
    original.forEach ( ([ flatData, links ], breadcrumbs ) => {
                const cut = breadcrumbs.lastIndexOf ( '/' );
                if ( cut > 0 && kept.has(breadcrumbs.slice(0,cut)) ) {
                            kept.add ( breadcrumbs )
                            storage.set ( breadcrumbs, flatData )
                            return
                    }
                const inRow = inData.index ( breadcrumbs );
                if ( !inRow || !sameKind ( flatData, inRow[1] ) ) {   // Nothing to insert here
                            kept.add ( breadcrumbs )
                            storage.set ( breadcrumbs, flatData )
                            return
                    }
                merged.add ( breadcrumbs )
                if ( !(flatData instanceof Array) ) {   // Objects keep their data
                            storage.set ( breadcrumbs, flatData )
                            return
                    }
                const
                      [ , inFlat, , inEdges ] = inRow
                    , items    = new Set ( links.map ( ([,child]) => +child ) )   // Indexes of items with own dt-lines (objects, arrays)
                    , inItems  = new Set ( inEdges.map ( br => +childKey(br) ) )
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
                            if ( inItems.has(i) ) {
                                        const
                                              item   = `${breadcrumbs}/${i}`
                                            , orItem = original.get ( item )
                                            ;
                                        if ( orItem && sameKind ( orItem[0], inData.index(item)[1] ) )   continue   // Extended as an original item
                                        paths.move ( breadcrumbs, i, arr.length )   // A new item goes to the end
                                        newItems.add ( item )
                                        arr.push ( null )
                                        continue
                                }
                            if ( !(i in inFlat) || has.has(inFlat[i]) )   continue
                            arr.push ( inFlat[i] )
                            has.add ( inFlat[i] )
                    }
                storage.set ( breadcrumbs, arr )
        }) // forEach original

    // New arrays and new array items of the incoming data
    inData.query ( inStorage => {
                inStorage.look ( ({ flatData, breadcrumbs, next }) => {
                            const
                                  cut    = breadcrumbs.lastIndexOf ( '/' )
                                , parent = cut > 0 ? breadcrumbs.slice ( 0, cut ) : null
                                , orParent = parent ? original.get ( parent ) : null
                                , isNewArray = orParent && merged.has(parent) && !(orParent[0] instanceof Array)   // A new array in an extended object
                                                && flatData instanceof Array
                                                && !original.has(breadcrumbs) && !orParent[0].hasOwnProperty(childKey(breadcrumbs))
                                , isNew = newItems.has ( breadcrumbs ) || ( parent !== null && added.has(parent) ) || isNewArray
                                ;
                            if ( !isNew )   return next ()
                            storage.set ( paths.path ( breadcrumbs ), flatData )
                            added.add ( breadcrumbs )
                            return next ()
                    })
        }) // inData.query
} // insert func.



export default insert
