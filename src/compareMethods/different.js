'use strict'
/**
 *   Different -> Provides only key/values and structures that are not exists in original data
 * 
 */

function different ( flatStore, update, index ) {
        update.query ( upStore => {
                            upStore.look (({ name, breadcrumbs, flatData:uData, next }) => {   // Look for data
                                            const orgLine = index ( breadcrumbs );

                                            if ( !orgLine ) {
                                                    flatStore.set ( name, uData )
                                                    return next ()
                                                }
                                            const 
                                                  upIsArray = uData instanceof Array
                                                , [ , orgFd ] = orgLine
                                                , orgIsArray = orgFd instanceof Array
                                                ;
                                            if ( upIsArray !== orgIsArray ) {
                                                        flatStore.set ( name, uData )
                                                }
                                            else if ( upIsArray ) {
                                                        const identical = ( uData.length === orgFd.length ) && ( uData.every ( (el,i) => el === orgFd[i] ));
                                                        if ( !identical ) {  
                                                                flatStore.set ( name, uData )
                                                                return next ()
                                                            }
                                                        const l = []
                                                        uData.forEach ( el => {
                                                                        if ( !orgFd.includes(el) )   l.push(el)
                                                                })
                                                        flatStore.set ( name, l )
                                                }
                                            else {
                                                        const
                                                              ud = Object.entries ( uData )
                                                            , r = {}
                                                            ;
                                                        ud.forEach ( ([k, v]) => {
                                                                        if ( !orgFd.hasOwnProperty(k) )   r[k] = v
                                                                        if ( v !== orgFd[k]           )   r[k] = v
                                                                })
                                                        flatStore.set ( name, r )
                                                }                                            
                                            return next ()
                                    }) // look data

                            upStore.look (({ links, next })=> { // Look for links
                                            const list = links.map ( ([k,v]) => `${k}/${v}`);
                                            flatStore.connect ( list )
                                            return next ()
                                    }) // look links
                }) // update query
} // different func.



export default different


