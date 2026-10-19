'use strict'
/**
 *  Change -> Which data elements have different values: 
 *   - Collect same keys with different values;
 *   - Ignores all new keys and new data structures;
 *   - Collect changed arrays. Changed arrays and structures come from the update with their objects and arrays;
 *   - Removed structures will become empty structures;
 *   - Structures with no changes will become an empty structures;
 *   - Arrays: items with own dt-lines (objects, arrays) keep their place in empty arrays;
 *   - A primitive that became a structure, or a structure that became a primitive, is a change: the update value is taken;
 * 
 */

import pathMap     from '../helpers/pathMap.js'
import copySubtree from '../helpers/copySubtree.js'
import arrayLength from '../helpers/arrayLength.js'
import isStructure from '../helpers/isStructure.js'



function change ( flatStore, update ) {
        if ( !update )   return null   // Update is required and must be a dt-object
        if ( !update.index || typeof(update.index)!== 'function' )   return null

        const 
              paths    = pathMap ()
            , replaced = new Set ()   // Structures taken from the update. Their original children are skipped
            ;
        flatStore.look ( ({ flatData, breadcrumbs, links, next }) => {  // Look for data
                        const cut = breadcrumbs.lastIndexOf ( '/' );
                        if ( cut > 0 && replaced.has(breadcrumbs.slice(0,cut)) ) {   // Inside a structure taken from the update
                                    replaced.add ( breadcrumbs )
                                    return next ()
                            }
                        const
                              isArray = flatData instanceof Array
                            , upObject = update.index(breadcrumbs)
                            , path = paths.path ( breadcrumbs )
                            , onlyItems = () => {   // Empty array, but items with own dt-lines (objects, arrays) keep their place
                                        const l = [];
                                        links
                                          .map ( ([,child]) => +child )
                                          .sort ( (a,b) => a - b )
                                          .forEach ( i => {
                                                    paths.move ( breadcrumbs, i, l.length )
                                                    l.push ( null )
                                            })
                                        return l
                                    }
                            , takeUpdate = data => {   // The structure from the update, with its children
                                        flatStore.set ( path, data )
                                        copySubtree ( flatStore, update, breadcrumbs, path )
                                        replaced.add ( breadcrumbs )
                                    }
                            ;
                        if ( upObject && !isStructure(upObject[1]) ) {   // The structure became a primitive: set the value in the parent
                                    const at = path.lastIndexOf ( '/' );
                                    if ( at > 0 )   flatStore.save ( path.slice ( 0, at ), path.slice ( at + 1 ), upObject[1] )
                                    replaced.add ( breadcrumbs )
                                    return next ()
                            }
                        if ( upObject ) {
                                const
                                      upData = upObject[1]
                                    , upIsArray = upData instanceof Array
                                    ;
                                if ( isArray != upIsArray ) {
                                         takeUpdate ( upData )
                                    }
                                else if ( isArray ) {
                                        const
                                              items   = new Set ( links.map ( ([,child]) => +child ) )   // Indexes of items with own dt-lines (objects, arrays)
                                            , upItems = new Set ( upObject[3].map ( br => +br.slice ( br.lastIndexOf('/') + 1 ) ) )
                                            , length  = arrayLength ( flatData, items )
                                            ;
                                        let identical = ( length === arrayLength ( upData, upItems ) );   // Values and items on the same places
                                        for ( let i = 0; identical && i < length; i++ ) {
                                                        if      ( items.has(i) !== upItems.has(i) )            identical = false
                                                        else if ( !items.has(i) && flatData[i] !== upData[i] ) identical = false
                                            }
                                        if ( !identical )  takeUpdate ( upData )
                                        else               flatStore.set ( path, onlyItems () )
                                    }
                                else {
                                        const
                                              m = Object.entries ( flatData )
                                            , r = {}
                                            , structures = []   // Primitives that became structures
                                            ;
                                        m.forEach ( ([k,v]) => {
                                                        if ( !upData.hasOwnProperty(k) ) {
                                                                const upChild = update.index ( `${breadcrumbs}/${k}` );
                                                                if ( upChild )   structures.push ( k )
                                                                else if ( v !== undefined )   r[k] = undefined   // Removed key
                                                                return
                                                            }
                                                        if ( v !== upData[k] )   r[k] = upData[k]
                                                })
                                        flatStore.set ( path, r )
                                        structures.forEach ( k => {
                                                        const child = `${breadcrumbs}/${k}`;
                                                        flatStore.set ( `${path}/${k}`, update.index ( child )[1] )
                                                        copySubtree ( flatStore, update, child, `${path}/${k}` )
                                                })
                                    }
                            } // if upObject
                        else {
                                    if ( isArray )   flatStore.set ( path, onlyItems () )
                                    else             flatStore.set ( path, {})
                            }
                        return next ()
            }) // look data
} // change func.



export default change


