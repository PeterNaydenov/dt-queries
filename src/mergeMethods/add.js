'use strict'
/**
 *    Add - Add only new key/values and keep the existing data
 *     - objects: keys that the original doesn't have are added, with their structures. Existing keys keep the original value;
 *     - arrays: values that the original array doesn't have are added at the end. Incoming objects and arrays are added at the end too,
 *       but an object (or array) on the place of an original one of the same type gets only its new keys;
 *     - a changed structure (object <-> array, value <-> structure) keeps the original;
 *
 */

import pathMap     from '../helpers/pathMap.js'
import arrayLength from '../helpers/arrayLength.js'
import isStructure from '../helpers/isStructure.js'



const
      childKey = br => br.slice ( br.lastIndexOf('/') + 1 )
    , sameKind = ( a, b ) => isStructure(a) && isStructure(b) && (a instanceof Array) === (b instanceof Array)
    ;



function add ( flatStore, update, index ) {
    if ( !update || typeof update.query !== 'function' || !index || typeof index !== 'function' )   return null   // `update` must be a dt-object and `index` must be a function (e.g. `flat.index`)
    const
          kept     = new Set ()   // Original dt-lines without a matching update: they stay as they are
        , newItems = new Set ()   // Incoming array items that go to the end of the original array
        , paths    = pathMap ()
        ;
    // The original data, with the new values
    flatStore.look ( ({ flatData, breadcrumbs, links, next }) => {
                const cut = breadcrumbs.lastIndexOf ( '/' );
                if ( cut > 0 && kept.has(breadcrumbs.slice(0,cut)) ) {
                            kept.add ( breadcrumbs )
                            flatStore.set ( breadcrumbs, flatData )
                            return next ()
                    }
                const upLine = update.index ( breadcrumbs );
                if ( !upLine || !sameKind ( flatData, upLine[1] ) ) {   // Nothing to add here
                            kept.add ( breadcrumbs )
                            flatStore.set ( breadcrumbs, flatData )
                            return next ()
                    }
                const [ , upData, , upEdges ] = upLine;
                if ( flatData instanceof Array ) {
                            const
                                  items    = new Set ( links.map ( ([,child]) => +child ) )   // Indexes of items with own dt-lines (objects, arrays)
                                , upItems  = new Set ( upEdges.map ( br => +childKey(br) ) )
                                , length   = arrayLength ( flatData, items )
                                , upLength = arrayLength ( upData, upItems )
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
                            for ( let i = 0; i < upLength; i++ ) {
                                        if ( upItems.has(i) ) {
                                                    const item = `${breadcrumbs}/${i}`;
                                                    if ( items.has(i) && sameKind ( index(item)[1], update.index(item)[1] ) )   continue   // Gets its new keys below
                                                    paths.move ( breadcrumbs, i, arr.length )   // A new item goes to the end
                                                    newItems.add ( item )
                                                    arr.push ( null )
                                                    continue
                                            }
                                        if ( !(i in upData) || has.has(upData[i]) )   continue
                                        arr.push ( upData[i] )
                                        has.add ( upData[i] )
                                }
                            flatStore.set ( breadcrumbs, arr )
                            return next ()
                    }
                const
                      orKeys = new Set ( links.map ( ([,child]) => child ) )   // Keys with structures in the original
                    , obj = { ...flatData }
                    ;
                Object.entries ( upData ).forEach ( ([k,v]) => {
                            if ( !flatData.hasOwnProperty(k) && !orKeys.has(k) )   obj[k] = v   // A new key
                    })
                flatStore.set ( breadcrumbs, obj )
                return next ()
        }) // look original

    // New structures of the update
    const added = new Set ();   // Incoming dt-lines in the result
    update.query ( upStore => {
                upStore.look ( ({ flatData, breadcrumbs, next }) => {
                            const
                                  cut    = breadcrumbs.lastIndexOf ( '/' )
                                , parent = cut > 0 ? breadcrumbs.slice ( 0, cut ) : null
                                ;
                            let isNew = newItems.has ( breadcrumbs ) || ( parent !== null && added.has(parent) );
                            if ( !isNew && parent !== null && !index(breadcrumbs) ) {   // A key that the original doesn't have
                                        const orParent = index ( parent );
                                        isNew = orParent !== null && !kept.has(parent) && sameKind ( orParent[1], update.index(parent)[1] ) && !(orParent[1] instanceof Array)
                                }
                            if ( !isNew )   return next ()
                            flatStore.set ( paths.path ( breadcrumbs ), flatData )
                            added.add ( breadcrumbs )
                            return next ()
                    })
        }) // update.query
} // add func.



export default add
