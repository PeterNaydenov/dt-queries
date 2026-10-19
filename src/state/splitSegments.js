'use strict'
/**
 * DT-Toolbox query function. Splits a solid data into multiple data-segments.
 * A structure of the 'root' with the name of an existing segment stays in the 'root', so no segment is lost.
 * @param {dt-store} store - dt-store instance
 * @returns void - Result is stored in the 'store' instance
 */
function splitSegments ( store ) {
        const segments = new Set ();   // Existing segments
        store
            .use ( 'root' )
            .look ( ({ breadcrumbs, next }) => {
                        if ( breadcrumbs !== 'root' )   segments.add ( breadcrumbs )
                        return next ()
                })

        store.look ( ({
                          flatData
                        , breadcrumbs
                        , next
                    }) => {
                        let path = breadcrumbs;
                        if ( breadcrumbs.startsWith ( 'root/' ) ) {   // Children of the 'root' become segments
                                    const
                                          inRoot = breadcrumbs.slice ( 5 )
                                        , cut    = inRoot.indexOf ( '/' )
                                        , name   = cut < 0 ? inRoot : inRoot.slice ( 0, cut )
                                        ;
                                    if ( !segments.has(name) )   path = inRoot
                            }
                        store.set ( path, flatData )
                        return next ()
            }) // look
} // splitSegments func.



export default splitSegments
