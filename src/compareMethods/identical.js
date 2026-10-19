'use strict'
/**
 *  Identical: Take only data that is equal in original and update
 *   - arrays: equal primitives on the same place. Items with own dt-lines (objects, arrays) keep their place;
 *
 */

import pathMap     from '../helpers/pathMap.js'
import arrayLength from '../helpers/arrayLength.js'
import isStructure from '../helpers/isStructure.js'



function identical ( flatStore, update ) {

        if ( !update )   return null   // Update is required and must be a dt-object
        if ( !update.index || typeof(update.index)!== 'function' )   return null

        const 
              kept  = new Set ()   // Breadcrumbs of dt-lines in the result
            , lines = []
            , paths = pathMap ()
            ;
        // Find the dt-lines of the result first: array items keep their place only if they are in the result
        flatStore.look ( ({ flatData, breadcrumbs, links, next }) => {
                        const
                              upObject = update.index(breadcrumbs)
                            , cut = breadcrumbs.lastIndexOf ( '/' )
                            ;
                        if ( cut > 0 && !kept.has(breadcrumbs.slice(0,cut)) )   return next ()   // Parent is not in the result
                        if ( !upObject || !isStructure(upObject[1]) )   return next ()   // No structure in the update: not identical
                        if ( (flatData instanceof Array) !== (upObject[1] instanceof Array) )   return next ()
                        kept.add ( breadcrumbs )
                        lines.push ([ flatData, breadcrumbs, links, upObject ])
                        return next ()
            }) // look data

        lines.forEach ( ([ flatData, breadcrumbs, links, upObject ]) => {
                        const 
                              [ , upData, , upEdges ] = upObject
                            , path = paths.path ( breadcrumbs )
                            ;
                        if ( flatData instanceof Array ) {
                                const
                                      items   = new Set ( links.map ( ([,child]) => +child ) )   // Indexes of items with own dt-lines
                                    , upItems = new Set ( upEdges.map ( br => +br.slice ( br.lastIndexOf('/') + 1 ) ) )
                                    , l = []
                                    , length = arrayLength ( flatData, items )
                                    ;
                                for ( let i = 0; i < length; i++ ) {
                                                if ( items.has(i) ) {   // Keep the place of the item, if the item is in the result
                                                            if ( !kept.has(`${breadcrumbs}/${i}`) )   continue
                                                            paths.move ( breadcrumbs, i, l.length )
                                                            l.push ( null )
                                                            continue
                                                    }
                                                if ( !upItems.has(i) && flatData[i] === upData[i] )   l.push ( flatData[i] )
                                    }
                                flatStore.set ( path, l )
                            }
                        else {
                                const
                                      m = Object.entries ( flatData )
                                    , r = {}
                                    ;
                                m.forEach ( ([k,v]) => {
                                                if ( upData.hasOwnProperty(k) && v === upData[k] )   r[k] = v
                                            })
                                flatStore.set ( path, r )
                            }
            }) // forEach lines
} // identical func.



export default identical


