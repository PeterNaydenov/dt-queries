'use strict'

/**
 *   Missing:  Filter only keys and structures that are not available in update
 *
 */


function missing ( flatStore, update ) {

        if ( !update.index && typeof(update.index)!== 'function' )   return null   // Update should be a dt-object.
        flatStore.look ( ({ name, flatData, breadcrumbs, next }) => {   // Look for the data
                        const 
                              isArray = flatData instanceof Array
                            , upLine = update.index(breadcrumbs)
                            ;

                        if ( !upLine ) {
                                    flatStore.set ( name, flatData )
                                    return next ()
                            }
                        
                        const 
                              upData = upLine[1]
                            , upIsArray = upData instanceof Array
                            ;
                        if ( isArray != upIsArray ) {
                                 flatStore.set ( name, flatData )
                            }
                        else if ( isArray ) {
                                const l = [];
                                flatData.forEach ( (el,i) => {
                                                if ( !upData.includes(el))   l.push(el)
                                            })
                                flatStore.set ( name, l )
                            }
                        else {
                                const 
                                      m = Object.entries ( flatData )
                                    , r = {}
                                    ;
                                m.forEach ( ([k,v]) => {
                                                if ( upData[k] == undefined )   r[k] = v
                                            })
                                flatStore.set ( name, r )
                            }
                        return next ()
            }) // look data

        flatStore.look (({ links, next }) => {
                        const theList = links.map ( ([k,v]) => `${k}/${v}`);
                        flatStore.connect ( theList )
                        return next ()
            }) // look links

} // missing func.



export default missing


