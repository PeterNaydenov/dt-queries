'use strict'
/**
 * DT-Toolbox query function. Splits a solid data into multiple data-segments.
 * @param {dt-store} store - dt-store instance
 * @returns void - Result is stored in the 'store' instance
 */
function splitSegments ( store ) {
        const linkBuffer = {};
        store.look ( ({
                          name
                        , flatData
                        , links
                        , next
                    }) => {
                        links.forEach ( ([parent, child]) => {
                                    if ( parent === 'root' )   return
                                    linkBuffer[child] = [ parent, child ]
                                })
                        store.set ( name, flatData )
                        if ( linkBuffer[name] ) {
                                    const [parent, child] = linkBuffer[name];
                                    store.connect ( [`${parent}/${child}`])
                            }
                        return next ()
            }) // look
} // splitSegments func.



export default splitSegments


