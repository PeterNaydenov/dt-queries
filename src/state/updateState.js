'use strict'
/**
 * DT-Toolbox query function for state update.
 * @name updateState
 * @param {dt-store} store - dt-store instance
 * @param {dt-object} changes - Changes should come as a dt-object, splited to segments
 * Segments, values and structures of the state 'root' take the changes with the same name. New keys and segments are ignored.
 * @returns void - Result is stored in the 'store' instance
 */
import isStructure from '../helpers/isStructure.js'
import copySubtree from '../helpers/copySubtree.js'



function updateState ( store, changes ) {
    const 
          changesMainLine = changes.index ( 'root' )[1]   // Only the 'root' dt-line. `export('root')` copied all dt-lines under it
        , segmentList     = []
        ;
    let 
          mainStateLine = null
        , rootStructures = []   // Keys of the structures in the state 'root'
        ;

    store
      .use ( 'root' )
      .look ( ({ flatData, breadcrumbs, links, next }) => {
                    if ( breadcrumbs === 'root' ) {  
                                    mainStateLine = flatData
                                    rootStructures = links.map ( ([,child]) => child )
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
                changes.query ( changeStore => {
                                changeStore
                                        .from ( segmentName )
                                        .look ( ({ flatData, breadcrumbs, next }) => {
                                                        hasUpdate = true
                                                        store.set ( breadcrumbs, flatData )
                                                        return next ()
                                                })
                        })
                // If update has no segment with the same name, check if 'changeMainLine' has a property with the same name and take it
                if ( !hasUpdate && changesMainLine.hasOwnProperty(segmentName) ) {
                                hasUpdate = true
                                store.save ( 'root', segmentName, changesMainLine[segmentName] )
                    }
                // If no updates until now, take the segment from the state
                if ( !hasUpdate ) { // Take 
                        store
                            .from ( segmentName )
                            .look ( ({ flatData, breadcrumbs, next }) => {
                                        store.set ( breadcrumbs, flatData )
                                        return next ()
                                })
                    }
        }) // forEach segmentList

    // Search for properties:
    Object.entries ( mainStateLine ).forEach ( ([key, value]) => {
                let hasUpdate = false;
                // Check update for segment with the same name
                
                changes.query ( changeStore => {
                                changeStore
                                    .from ( key )
                                    .look ( ({ flatData, breadcrumbs, next }) => {
                                                hasUpdate = true
                                                store.set ( breadcrumbs, flatData )
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

    // Search for structures in the 'root':
    rootStructures.forEach ( key => {
                const path = `root/${key}`;
                let hasUpdate = false;
                // Check update for segment with the same name
                changes.query ( changeStore => {
                                changeStore
                                    .from ( key )
                                    .look ( ({ flatData, breadcrumbs, next }) => {
                                                hasUpdate = true
                                                store.set ( breadcrumbs, flatData )
                                                return next ()
                                        })
                        })
                // If no segment with the same name, check if the 'root' of the update has this key and take it
                if ( !hasUpdate ) {
                                const changesLine = changes.index ( path );
                                if ( changesLine && isStructure(changesLine[1]) ) {   // A structure, with all its data
                                            hasUpdate = true
                                            store.set ( path, changesLine[1] )
                                            copySubtree ( store, changes, path, path )
                                    }
                                else if ( changesMainLine.hasOwnProperty(key) ) {   // A value
                                            hasUpdate = true
                                            store.save ( 'root', key, changesMainLine[key] )
                                    }
                    }
                // If no updates until now, take the structure from the state
                if ( !hasUpdate ) {
                        store
                            .from ( path )
                            .look ( ({ flatData, breadcrumbs, next }) => {
                                        store.set ( breadcrumbs, flatData )
                                        return next ()
                                })
                    }
        })
    
} // updateState func.



export default updateState


