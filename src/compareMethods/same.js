'use strict'
/**
 *  Same: Keep the structure of the original data, take primitive values from the update
 *  - Structures, keys and array lengths stay as in the original;
 *  - A primitive takes the update value, if the update has a primitive on the same place;
 *  - Otherwise the original value stays;
 *  - New structures and keys of the update are not applied;
 *  - There is no check if values are changed.
 *
 */

import arrayLength from '../helpers/arrayLength.js'



function same ( flatStore, update ) {

        if ( !update )   return null   // Update is required and must be a dt-object
        if ( !update.index || typeof(update.index)!== 'function' )   return null

        flatStore.look ( ({ flatData, breadcrumbs, links, next }) => {
                        const
                              upLine  = update.index(breadcrumbs)
                            , upFd    = upLine ? upLine[1] : null
                            , isArray = flatData instanceof Array
                            , sameKind = upFd !== null && typeof upFd === 'object' && ( upFd instanceof Array ) === isArray
                            ;

                        if ( !sameKind ) {   // No update or a changed structure: keep the original
                                flatStore.set ( breadcrumbs, flatData )
                                return next ()
                            }

                        if ( isArray ) {   // Same length, values on the same place
                                const
                                      items   = new Set ( links.map ( ([,child]) => +child ) )   // Indexes of items with own dt-lines (objects, arrays)
                                    , upItems = new Set ( upLine[3].map ( br => +br.slice ( br.lastIndexOf('/') + 1 ) ) )
                                    , length  = arrayLength ( flatData, items )
                                    , l = []
                                    ;
                                for ( let i = 0; i < length; i++ ) {
                                                if      ( items.has(i) || !(i in flatData) )   l.push ( null )   // Keep the place of the item
                                                else if ( i < upFd.length && !upItems.has(i) ) l.push ( upFd[i] )
                                                else                                           l.push ( flatData[i] )
                                    }
                                flatStore.set ( breadcrumbs, l )
                                return next ()
                            }

                        const r = {};
                        Object.entries ( flatData ).forEach ( ([k,v]) => {
                                        r[k] = upFd.hasOwnProperty(k) ? upFd[k] : v   // Flat data holds primitives only
                                })
                        flatStore.set ( breadcrumbs, r )
                        return next ()
            }) // look data
} // same func.



export default same
