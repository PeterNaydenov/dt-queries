'use strict'
/**
 *   Different -> Provides only key/values and structures that are not exists in original data
 *    - all structures of the update are in the result. Structures without differences are empty;
 *    - values: new keys and changed values, with the update value;
 *    - arrays: a new or changed value keeps its exact place (index). Places without differences stay empty;
 *    - new structures and changed structures (object <-> array, value <-> structure) come with all their data;
 *
 */

import arrayLength from '../helpers/arrayLength.js'
import isStructure from '../helpers/isStructure.js'



function different ( flatStore, update, index ) {
        if ( !update || typeof update.query !== 'function' || !index || typeof index !== 'function' )   return null   // `update` must be a dt-object and `index` must be a function (e.g. `flat.index`)
        update.query ( upStore => {
                            upStore.look (({ breadcrumbs, flatData:uData, links, next }) => {   // Look for data
                                            const
                                                  orgLine = index ( breadcrumbs )
                                                , upIsArray = uData instanceof Array
                                                ;
                                            if ( !orgLine || !isStructure(orgLine[1]) || (orgLine[1] instanceof Array) !== upIsArray ) {   // New or changed structure: all its data
                                                    flatStore.set ( breadcrumbs, uData )
                                                    return next ()
                                                }
                                            const [ , orgFd, , orgEdges ] = orgLine;
                                            if ( upIsArray ) {
                                                        const
                                                              items    = new Set ( links.map ( ([,child]) => +child ) )   // Items with own dt-lines are set on their place
                                                            , orgItems = new Set ( orgEdges.map ( br => +br.slice ( br.lastIndexOf('/') + 1 ) ) )
                                                            , orgLength = arrayLength ( orgFd, orgItems )
                                                            , l = []
                                                            ;
                                                        for ( let i = 0; i < uData.length; i++ ) {
                                                                    if ( items.has(i) || !(i in uData) )   continue
                                                                    if ( i >= orgLength || orgItems.has(i) || uData[i] !== orgFd[i] )   l[i] = uData[i]   // New place, a value on the place of a structure, or a changed value
                                                            }
                                                        flatStore.set ( breadcrumbs, l )
                                                        return next ()
                                                }
                                            const r = {};
                                            Object.entries ( uData ).forEach ( ([k, v]) => {
                                                            if ( !orgFd.hasOwnProperty(k) || v !== orgFd[k] )   r[k] = v
                                                    })
                                            flatStore.set ( breadcrumbs, r )
                                            return next ()
                                    }) // look data
                }) // update query
} // different func.



export default different
