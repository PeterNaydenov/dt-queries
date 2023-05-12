'use strict'
/**
 *    Add - Add only new key/values and keep the existing data
 * 
 */


function add ( flatStore, update, index ) {
    const linkBuffer = [];
    // Copy the existing data
    flatStore.look ( ({ name, flatData, breadcrumbs }) => { 
                flatStore.set ( name, flatData )
                if ( breadcrumbs.includes('/') )   flatStore.connect ([breadcrumbs])
                return 'next'
        })

    // Search for new data
    update.query ((upStore) => {
                        upStore.look ( ({ name, flatData:upData, breadcrumbs }) => {
                                    const
                                            isArray = upData instanceof Array
                                          , existingRow = index ( breadcrumbs )
                                          ;
                                    if ( existingRow == null ) {
                                                flatStore.set ( name, upData )
                                                const 
                                                          search = new RegExp ( `\/${name}$` )
                                                        , parent = breadcrumbs.replace( search, '').split('/').pop()
                                                        ;
                                                linkBuffer.push ( `${parent}/${name}` )
                                                return 'next'
                                        }

                                    const [ , orFd ] = existingRow;
                                    if ( isArray ) {
                                                upData.forEach ( el => {
                                                                if ( !orFd.includes(el) )   flatStore.push ( name, el )
                                                        })
                                        }
                                    else {
                                                const m = Object.entries ( upData );
                                                m.forEach ( ([k,v]) => {
                                                                if ( orFd[k] === undefined )   flatStore.save ( name, k, v )
                                                        })
                                        }
                                    return 'next'
                            })
                }) // update.query
    if ( linkBuffer.length > 0 )    flatStore.connect ( linkBuffer )
} // add func.



export default add


