'use strict'

/**
 *   Missing:  Keys of the original data that the update doesn't have. The data comes from the original
 *    - a key that the update has in any form (value or structure) is not missing;
 *    - a structure that the update doesn't have is missing with all its data;
 *    - arrays: values that the update array doesn't have. Items with own dt-lines (objects, arrays) keep their place;
 *
 */

import pathMap     from '../helpers/pathMap.js'
import arrayLength from '../helpers/arrayLength.js'
import isStructure from '../helpers/isStructure.js'



function missing ( flatStore, update ) {

        if ( !update )   return null   // Update is required and must be a dt-object
        if ( !update.index || typeof(update.index)!== 'function' )   return null   // Update should be a dt-object.
        const 
              lines  = []
            , kinds  = new Map ()   // Breadcrumbs -> is the original structure an array
            , absent = new Set ()   // dt-lines that the update has in another form
            , paths  = pathMap ()
            // The update has this structure in another form (value, or array <-> object)
            , otherForm = ( upLine, isArray ) => upLine && ( !isStructure(upLine[1]) || (upLine[1] instanceof Array) !== isArray )
            ;
        flatStore.look ( ({ flatData, breadcrumbs, links, next }) => {   // Array items need the form of their dt-lines first
                        lines.push ([ flatData, breadcrumbs, links ])
                        kinds.set ( breadcrumbs, flatData instanceof Array )
                        return next ()
            }) // look data

        lines.forEach ( ([ flatData, breadcrumbs, links ]) => {
                        const cut = breadcrumbs.lastIndexOf ( '/' );
                        if ( cut > 0 && absent.has(breadcrumbs.slice(0,cut)) ) {
                                    absent.add ( breadcrumbs )
                                    return
                            }
                        const 
                              isArray = flatData instanceof Array
                            , upLine  = update.index(breadcrumbs)
                            ;
                        if ( otherForm ( upLine, isArray ) ) {   // The update has this key: not missing
                                    absent.add ( breadcrumbs )
                                    return
                            }
                        const path = paths.path ( breadcrumbs );
                        if ( !upLine ) {   // The update doesn't have the structure: missing with all its data
                                    flatStore.set ( path, flatData )
                                    return
                            }
                        
                        const upData = upLine[1];
                        if ( isArray ) {
                                const
                                      items    = new Set ( links.map ( ([,child]) => +child ) )   // Indexes of items with own dt-lines
                                    , upItems  = new Set ( upLine[3].map ( br => +br.slice ( br.lastIndexOf('/') + 1 ) ) )
                                    , upValues = new Set ( upData.filter ( (el,i) => !upItems.has(i) ) )
                                    , l = []
                                    , length = arrayLength ( flatData, items )
                                    ;
                                for ( let i = 0; i < length; i++ ) {
                                                if ( items.has(i) ) {   // Keep the place of the item, if it is in the result
                                                            const item = `${breadcrumbs}/${i}`;
                                                            if ( otherForm ( update.index(item), kinds.get(item) ) )   continue
                                                            paths.move ( breadcrumbs, i, l.length )
                                                            l.push ( null )
                                                            continue
                                                    }
                                                if ( !upValues.has(flatData[i]) )   l.push ( flatData[i] )
                                    }
                                flatStore.set ( path, l )
                                return
                            }

                        const 
                              upChildren = new Set ( upLine[3].map ( br => br.slice ( br.lastIndexOf('/') + 1 ) ) )   // Keys with structures in the update
                            , r = {}
                            ;
                        Object.entries ( flatData ).forEach ( ([k,v]) => {
                                        if ( !upData.hasOwnProperty(k) && !upChildren.has(k) )   r[k] = v
                                })
                        flatStore.set ( path, r )
            }) // forEach lines
} // missing func.



export default missing


