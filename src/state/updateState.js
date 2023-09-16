'use strict'
/**
 * DT-Toolbox query function for state update.
 * @name updateState
 * @param {dt-store} store - dt-store instance
 * @param {dt-object} changes - Changes should come as a dt-object, splited to segments
 * @returns void - Result is stored in the 'store' instance
 */
function updateState ( store, changes ) {
    const 
          changesMainLine = changes.export ('root')[0][1]
        , segmentList     = []
        ;
    let mainStateLine = null; 

    store
      .use ( 'root' )
      .look ( ({ flatData, breadcrumbs, next }) => {
                    if ( breadcrumbs === 'root' ) {  
                                    mainStateLine = flatData
                                    return next ()
                        }
                    segmentList.push ( breadcrumbs )
                    return next ()
            })

    // Build 'root' dt-line according to the 'mainStateLine' structure:
    if ( mainStateLine instanceof Array )  store.set ( 'root', [] )
    else                                   store.set ( 'root', {} )

    // Search for segments:    
    segmentList.forEach ( segmentName => {
                let hasUpdate = false;
                // Check if update has a segment with the same name and take it
                const linkCache = {};
                changes.query ( changeStore => {
                                changeStore
                                        .from ( segmentName )
                                        .look ( ({ name, flatData, breadcrumbs, links, next }) => {
                                                        hasUpdate = true
                                                        store.set ( name, flatData )
                                                        if ( linkCache.hasOwnProperty(breadcrumbs) ) {
                                                                        const [ parent, child ] = linkCache[breadcrumbs];
                                                                        store.connect ( [`${parent}/${child}`])
                                                                }
                                                        links.forEach ( ([ parent, child ]) =>  linkCache[`${breadcrumbs}/${child}`] = [ parent, child ])
                                                        return next ()
                                                })
                        })
                // If update has no segment with the same name, check if 'changeMainLine' has a property with the same name and take it
                if ( !hasUpdate && changesMainLine.hasOwnProperty(segmentName) ) {
                                hasUpdate = true
                                store.save ( 'root', segmentName, mainStateLine[segmentName] )
                    }
                // If no updates until now, take the segment from the state
                if ( !hasUpdate ) { // Take 
                        store
                            .from ( segmentName )
                            .look ( ({ name, flatData, breadcrumbs, links, next }) => {
                                        store.set ( name, flatData )
                                        if ( linkCache.hasOwnProperty(breadcrumbs) ) {
                                                        const [ parent, child ] = linkCache[breadcrumbs];
                                                        store.connect ( [`${parent}/${child}`])
                                                }
                                        links.forEach ( ([ parent, child ]) =>  linkCache[`${breadcrumbs}/${child}`] = [ parent, child ])
                                        return next ()
                                })
                    }
        }) // forEach segmentList

    // Search for properties:
    Object.entries ( mainStateLine ).forEach ( ([key, value]) => {
                const linkCache = {};
                let hasUpdate = false;
                // Check update for segment with the same name
                
                changes.query ( changeStore => {
                                changeStore
                                    .from ( key )
                                    .look ( ({ name, flatData, breadcrumbs, links, next }) => {
                                                hasUpdate = true
                                                store.set ( name, flatData )
                                                if ( linkCache.hasOwnProperty(breadcrumbs) ) {
                                                                const [ parent, child ] = linkCache[breadcrumbs];
                                                                store.connect ( [`${parent}/${child}`])
                                                        }
                                                links.forEach ( ([parent, child]) =>  linkCache[`${breadcrumbs}/${child}`] = [parent, child] )
                                                return next ()
                                        })             
                        })

                // If no segment with the same name, check if 'rootDTLine' has a property with the same name and take it
                if ( !hasUpdate && changesMainLine.hasOwnProperty(key) ) {
                                hasUpdate = true
                                store.save ( 'root', key, changesMainLine[key] )
                    }
                // If no updates until now, take the property from the state
                if ( !hasUpdate )   store.save ( 'root', key, value )
        })
    
} // updateState func.



export default updateState


