'use strict'
/**
 *  Change -> Which data elements have different values: 
 *   - Collect same keys with different values;
 *   - Ignores all new keys and new data structures;
 *   - Collect changed arrays;
 *   - Removed structures will become empty structures;
 *   - Structures with no changes will become an empty structures;
 * 
 */

function change ( flatStore, update ) {
        const linkBuffer = [];

        if ( !update.index && typeof(update.index)!== 'function' )   return null

        flatStore.look ( ({ name, flatData, breadcrumbs }) => {  // Look for data
                        const 
                              isArray = flatData instanceof Array
                            , upObject = update.index(breadcrumbs)
                            ;
                        let search = null;
                        if ( upObject ) {
                                const 
                                      upData = upObject[1]
                                    , upIsArray = upData instanceof Array
                                    ;
                                if ( isArray != upIsArray ) {
                                         flatStore.set ( name, upData )
                                    }
                                else if ( isArray ) {
                                        const identical = (upData.length === flatData.length) && (upData.every ( (el,i) => el === flatData[i] ));
                                        if ( !identical )  flatStore.set ( name, upData ) 
                                        else               flatStore.set ( name, [])
                                    }
                                else {
                                        const 
                                              m = Object.entries ( flatData )
                                            , r = {}
                                            ;
                                        m.forEach ( ([k,v]) => {
                                                        const upV = upData[k];
                                                        if ( v !== upV )   r[k] = upV
                                                        search = update.index ( `${breadcrumbs}/${k}` )
                                                        if ( search ) {  
                                                                flatStore.set ( k, search )
                                                                linkBuffer.push ( `${search[2]}/${search[0]}` )
                                                                search = null
                                                            }
                                                    })
                                        flatStore.set ( name, r )
                                    }
                            } // if upObject
                        else {
                                    if ( isArray )   flatStore.set ( name, [])
                                    else             flatStore.set ( name, {})
                            }
                        if ( breadcrumbs.includes('/') )   flatStore.connect ([breadcrumbs])
                        return 'next'
            }) // look data
} // change func.



export default change


