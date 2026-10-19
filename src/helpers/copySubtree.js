'use strict'
/**
 *  Copy the dt-lines under a structure of another dt-object into the query result.
 *  Use it when a query takes a structure from the incoming data: the structure
 *  comes with its objects and arrays, the deep structure included.
 *  @param {object} store - Query store of the result
 *  @param {object} source - The dt-object with the structure
 *  @param {string} breadcrumbs - Breadcrumbs of the structure in `source`
 *  @param {string} path - Path of the structure in the result
 */
function copySubtree ( store, source, breadcrumbs, path ) {
        const cut = breadcrumbs.length;
        source.query ( sourceStore => {
                    sourceStore
                        .from ( breadcrumbs )
                        .look ( ({ flatData, breadcrumbs:br, next }) => {
                                    if ( br !== breadcrumbs )   store.set ( `${path}${br.slice ( cut )}`, flatData )   // The structure itself is set by the query
                                    return next ()
                            })
            })
} // copySubtree func.



export default copySubtree
