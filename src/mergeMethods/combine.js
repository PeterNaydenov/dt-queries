'use strict'
/**
 *   Combine: Preserve all values from incoming and original data
 *    - use all data structures from the incoming data;
 *    - combine original and incoming values into arrays;
 *    - incoming data structure has a priority;
 *    - arrays extend existing array with incoming values;
 */


function combine ( storage, inData ) {
    const crumbs = [];
    storage.look ( ({ name, flatData, breadcrumbs, links}) => {
                let inRow;
                const isArray = flatData instanceof Array;
                crumbs.push ( breadcrumbs )

                if ( isArray ) {
                            let 
                                  arr = []
                                , linkArr = []
                                ;
                            flatData.forEach ( (el,i) => {  // Check for extra incoming structures
                                        const 
                                              checkIndex = `${breadcrumbs}/${i}`
                                            , extraRow = inData.index( checkIndex )
                                            ;
                                        if ( !extraRow ) {   
                                                    arr.push ( el )
                                            }
                                        else {
                                                    const
                                                          extraFlat = extraRow[1]
                                                        , isExtraArray = extraFlat instanceof Array
                                                        ;
                                                    if ( isExtraArray )  extraFlat.push ( el )
                                                    else                 extraFlat['___history'] = el
                                                    storage.set ( i, extraFlat )
                                                    crumbs.push ( checkIndex )
                                                    linkArr.push ( checkIndex )
                                            }
                                })
                            inRow = inData.index ( breadcrumbs )
                            if ( !inRow ) {
                                        storage.set ( name, arr )
                                        // Check if parent has property with this name:
                                        let tmp = breadcrumbs.split( '/' );
                                        tmp.pop ()
                                        let 
                                              parent = tmp.join ( '/' )
                                            , propOwner = inData.index ( parent )[1]
                                            , prop = propOwner[name]
                                            ;
                                        if ( prop )   storage.push ( name, prop )
                                }
                            else {
                                    let isInRowArray = inRow[1] instanceof Array;
                                    if ( isInRowArray ) {
                                                inRow[1].forEach ( el => {
                                                            if ( !arr.includes(el) )   arr.push ( el )
                                                        })
                                                storage.set ( name, arr )                                        
                                        }
                                    else {
                                                arr.push ( inRow[1] )
                                        }
                                }
                            if ( breadcrumbs.includes('/'))   storage.connect ([breadcrumbs])
                            storage.connect ( linkArr )
                            return 'next'
                    } // if isArray


                let 
                      entries = Object.entries ( flatData )
                    , entryKeys = Object.keys ( flatData )
                    ;
                storage.set ( name, {})
                if ( breadcrumbs.includes('/'))   storage.connect ([breadcrumbs])
                inRow = inData.index ( breadcrumbs )
                entries.forEach ( ([k,v]) => {
                                const 
                                      checkKey = `${breadcrumbs}/${k}`
                                    , extraData = inData.index ( checkKey )
                                    ;
                                if ( !extraData ) {
                                            const 
                                                  [ ,updateObject ] = inRow ? inRow : []
                                                , update = updateObject[k]
                                                ;
                                            if ( update ) {
                                                        storage.set ( k, [ v, update ])
                                                        storage.connect ([checkKey])
                                                        crumbs.push ( checkKey )
                                                }
                                            else {
                                                        storage.save ( name, k , v )
                                                }
                                    }
                                else {
                                            const isExtraArray = extraData[1] instanceof Array;
                                            if ( isExtraArray ) { 
                                                        storage.set ( k, [])
                                                        storage.push ( k, v ) 
                                                        extraData[1].forEach ( el => storage.push (k,el) )
                                                }
                                            else  {      
                                                        storage.set ( k, extraData[1] )
                                                        storage.save ( k, '___history', v )
                                                }
                                            storage.connect ([checkKey])
                                    }
                    })
                // Fulfill key/values that only incoming objects has
                inData.query ( inStorage => { 
                                            let linkProps = links.map ( ([,child]) => child );
                            inStorage.look (({key,value, breadcrumbs:inBreadcrumbs}) => {
                                            if ( inBreadcrumbs !== breadcrumbs )   return 'next'  // Scan corresponding objects only
                                            if ( linkProps.includes(key) )   return
                                            if ( !entryKeys.includes(key) && key!= null )   storage.save ( name, key, value )
                                    })
                    })
                return 'next'
        }) // look storage

    inData.query ( inStorage => {   // Fulfill the new structures from incoming data
                    inStorage.look (({ name, flatData, breadcrumbs }) => {
                                    if ( !crumbs.includes(breadcrumbs) ) {
                                                storage.set ( name, flatData )
                                                storage.connect([breadcrumbs])
                                                return 'next'
                                        }
                            }) // look inStorage
        }) // query inData
} // combine func.



export default combine


