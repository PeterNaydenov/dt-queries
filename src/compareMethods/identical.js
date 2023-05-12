'use strict'


function identical ( flatStore, update ) {

        if ( !update.index && typeof(update.index)!== 'function' )   return null

        flatStore.look ( ({ name, flatData, breadcrumbs }) => {
                        const 
                              isArray = flatData instanceof Array
                            , upObject = update.index(breadcrumbs)
                            ;
                        if ( upObject ) {
                                const 
                                      upData = upObject[1]
                                    , upIsArray = upData instanceof Array
                                    ;
                                if ( isArray != upIsArray )   return 'next'
                                if ( isArray ) {
                                        const l = [];
                                        flatData.forEach ( (el,i) => {
                                                        if ( el === upData[i] )   l.push(el)
                                                    })
                                        flatStore.set ( name, l )
                                    }
                                else {
                                        const 
                                              m = Object.entries ( flatData )
                                            , r = {}
                                            ;
                                        m.forEach ( ([k,v]) => {
                                                        if ( v == upData[k] )   r[k] = v
                                                    })
                                        flatStore.set ( name, r )
                                    }
                                if ( breadcrumbs.includes('/') )    flatStore.connect ([breadcrumbs])
                            }
                        return 'next'
            }) // look data
} // identical func.



export default identical


