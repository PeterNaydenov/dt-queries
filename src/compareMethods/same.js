'use strict'
/**
 *  Same: Filter on update -> Take only keys available in original data but values from update
 *  - There is no check if values are changed.
 *
 */


function same ( flatStore, update ) {

        if ( !update.index && typeof(update.index)!== 'function' )   return null

        flatStore.look ( ({ name, flatData, breadcrumbs }) => {
                        const 
                              upLine = update.index(breadcrumbs)
                            , isArray = flatData instanceof Array
                            ;
                            
                        if ( !upLine ) {  
                                flatStore.set ( name, isArray ? [] : {})  
                                return 'next'
                            }
                        const 
                              [ , upFd ] = upLine
                            , upIsArray = upFd instanceof Array
                            ;

                        if ( isArray !== upIsArray ) {  // If structure was changed - take data from the update
                                    flatStore.set ( name, upFd )
                            }
                        else if ( isArray ) {   // If array - take data from the update
                                    flatStore.set ( name, upFd )
                            }
                        else {  // 
                                    const 
                                          m = Object.entries ( flatData )
                                        , r = {}
                                        ;
                                    m.forEach ( ([k,v]) => {
                                                    const upV = upFd[k];
                                                    if ( upV !== undefined )   r[k] = upV
                                            })
                                    flatStore.set ( name, r )
                            }
                        return 'next'
            }) // look data

        flatStore.look (({ links }) => {
                        const theList = links.map ( ([k,v]) => `${k}/${v}`);
                        flatStore.connect ( theList )
                        return 'next'
            }) // look links
} // same func.



export default same


