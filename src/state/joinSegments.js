'use strict'
/**
 * DT-Toolbox query function. Consolidate multiple data-segments in a single solid data.
 * @param {dt-store} store - dt-store instance
 * @returns void - Result is stored in the 'store' instance
 */
function joinSegments ( store ) {
        store.look ( ({
                          flatData
                        , breadcrumbs
                        , next
                    }) => {
                        const inRoot = ( breadcrumbs === 'root' || breadcrumbs.startsWith ( 'root/' ) );
                        store.set ( inRoot ? breadcrumbs : `root/${breadcrumbs}`, flatData )   // Segments go under the 'root'
                        return next ()
            }) // look
} // joinSegments func.



export default joinSegments


