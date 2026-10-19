'use strict'
/**
 *  Update - which keys of the original data are changed by the update, and how
 *    - a changed value is shown with its new value;
 *    - keys without changes, keys missing in the update and new keys are not shown;
 *    - arrays: a change keeps its exact place (index). Places without changes stay empty;
 *    - a value that became a structure, or a changed structure (object <-> array): an empty structure of the new type;
 *    - a structure that became a value: the new value;
 *    - a structure without changes is not shown;
 *
 */

import arrayLength from '../helpers/arrayLength.js'
import isStructure from '../helpers/isStructure.js'



const empty = data => data instanceof Array ? [] : {};



function update ( store, updateObject ) {
        const
              lines    = []          // [ flatData, breadcrumbs, links, status, upLine ] in the order of `look`
            , blocked  = new Set ()  // dt-lines inside a structure without a matching update
            , included = new Set ()  // dt-lines in the result
            , results  = new Map ()  // Breadcrumbs -> [ data, new empty structures as [ path, data ] ]
            ;
        // Status of each dt-line: 'none' - no update, 'value' - the update has a value, 'type' - changed structure, 'same' - same structure
        store.look ( ({ flatData, breadcrumbs, links, next }) => {
                    const cut = breadcrumbs.lastIndexOf ( '/' );
                    if ( cut > 0 && blocked.has(breadcrumbs.slice(0,cut)) ) {
                                blocked.add ( breadcrumbs )
                                return next ()
                        }
                    const upLine = updateObject.index ( breadcrumbs );
                    let status = 'same';
                    if      ( !upLine )                                                       status = 'none'
                    else if ( !isStructure(upLine[1]) )                                       status = 'value'
                    else if ( (upLine[1] instanceof Array) !== (flatData instanceof Array) )  status = 'type'
                    if ( status !== 'same' )   blocked.add ( breadcrumbs )   // Children have nothing to compare
                    lines.push ([ flatData, breadcrumbs, links, status, upLine ])
                    return next ()
            }) // look

        // Children first: a structure is in the result when something inside is changed
        const statusOf = new Map ( lines.map ( ([ , breadcrumbs, , status ]) => [ breadcrumbs, status ]) );
        for ( let n = lines.length - 1; n >= 0; n-- ) {
                    const [ flatData, breadcrumbs, links, status, upLine ] = lines[n];
                    if ( status === 'type' ) {   // Show just the new structure
                                results.set ( breadcrumbs, [ empty(upLine[1]), [] ] )
                                included.add ( breadcrumbs )
                                continue
                        }
                    if ( status !== 'same' )   continue
                    const
                          [ , upData, , upEdges ] = upLine
                        , upKeys   = upEdges.map ( br => br.slice ( br.lastIndexOf('/') + 1 ) )   // Keys with structures in the update
                        , children = links.map ( ([,child]) => child )
                        , news     = []   // A value that became a structure: [ path, empty structure ]
                        ;
                    let changed = children.some ( child => included.has(`${breadcrumbs}/${child}`) );
                    if ( flatData instanceof Array ) {
                                const
                                      items    = new Set ( children.map ( Number ) )
                                    , upItems  = new Set ( upKeys.map ( Number ) )
                                    , length   = arrayLength ( flatData, items )
                                    , upLength = arrayLength ( upData, upItems )
                                    , l = []
                                    ;
                                for ( let i = 0; i < length && i < upLength; i++ ) {
                                            if ( items.has(i) ) {   // An object or array: a value on its place is a change
                                                        if ( !upItems.has(i) && statusOf.get(`${breadcrumbs}/${i}`) === 'none' ) {
                                                                    l[i] = upData[i]
                                                                    changed = true
                                                            }
                                                        continue
                                                }
                                            if ( upItems.has(i) ) {   // A value became a structure
                                                        news.push ([ `${breadcrumbs}/${i}`, empty ( updateObject.index(`${breadcrumbs}/${i}`)[1] ) ])
                                                        changed = true
                                                        continue
                                                }
                                            if ( flatData[i] !== upData[i] ) {
                                                        l[i] = upData[i]
                                                        changed = true
                                                }
                                    }
                                results.set ( breadcrumbs, [ l, news ] )
                        }
                    else {
                                const r = {};
                                Object.entries ( flatData ).forEach ( ([k,v]) => {
                                            if ( upData.hasOwnProperty(k) ) {
                                                        if ( v !== upData[k] ) {
                                                                    r[k] = upData[k]
                                                                    changed = true
                                                            }
                                                        return
                                                }
                                            if ( upKeys.includes(k) ) {   // A value became a structure
                                                        news.push ([ `${breadcrumbs}/${k}`, empty ( updateObject.index(`${breadcrumbs}/${k}`)[1] ) ])
                                                        changed = true
                                                }
                                    })
                                children.forEach ( child => {   // A structure that became a value
                                            const br = `${breadcrumbs}/${child}`;
                                            if ( statusOf.get(br) !== 'value' )   return
                                            r[child] = updateObject.index ( br )[1]
                                            changed = true
                                    })
                                results.set ( breadcrumbs, [ r, news ] )
                        }
                    if ( changed )   included.add ( breadcrumbs )
            } // for lines

        lines.forEach ( ([ flatData, breadcrumbs ]) => {   // Parents first
                    if ( !included.has(breadcrumbs) ) {
                                if ( breadcrumbs === 'root' )   store.set ( 'root', empty(flatData) )   // The result always has a 'root'
                                return
                        }
                    const [ data, news ] = results.get ( breadcrumbs );
                    store.set ( breadcrumbs, data )
                    news.forEach ( ([ path, structure ]) => store.set ( path, structure ) )
            }) // forEach lines
} // update func.



export default update
