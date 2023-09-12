'use strict'
/**
 * DT-Toolbox query function. Consolidate multiple data-segments in a single solid data.
 * @param {dt-store} store - dt-store instance
 * @returns void - Result is stored in the 'store' instance
 */
function joinSegments ( store ) {
        const linkBuffer = {};
        store.look ( ({
                          name
                        , flatData
                        , breadcrumbs
                        , links
                        , next
                    }) => {
                        store.set ( name, flatData )
                        if ( name === 'root'      )   return next ()
                        if ( name === breadcrumbs )   store.connect ([`root/${name}`])
                        links.forEach ( ([parent, child]) =>  linkBuffer[child] = [ parent, child ]   )
                        if ( linkBuffer[name] ) {
                                const [parent, child] = linkBuffer[name];
                                store.connect ( [`${parent}/${child}`])
                            }
                        return next ()
            }) // look
} // joinSegments func.



export default joinSegments


