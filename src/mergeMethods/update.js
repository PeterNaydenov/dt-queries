'use strict'
/**
 *  Update - take from updateObject only existing data fields
 *    - on change in data-structure, use the original;
 *    - on arrays, overwrite with the incoming;
 *    - on objects, take only keys that are defined in the original data;
 * 
 */

function update ( store, updateObject ) {
        store.look ( ({ name, flatData, breadcrumbs, next }) => {
                    const 
                          inUpdateLine = updateObject.index(breadcrumbs)
                        , isArray = flatData instanceof Array
                        ;
                        
                    if ( !inUpdateLine ) {   // If no update - take original data 
                                store.set ( name, flatData )
                                if ( breadcrumbs.includes('/') )   store.connect ([breadcrumbs])
                                return next ()
                        }
                    const 
                          [ ,inData ] = inUpdateLine
                        , inIsArray = inData instanceof Array
                        ;
                    if ( isArray !== inIsArray ) {   // If change of structure type, keep the original
                                store.set ( name, flatData )
                        }
                    else if ( isArray ) {   // If both are array -> get the incoming array
                                store.set ( name, inData )
                        }
                    else {
                                store.set ( name, {} )
                                let entries = Object.entries ( flatData );
                                entries.forEach ( ([k,v]) => {
                                                const hasUpdate = inData.hasOwnProperty(k);
                                                if ( hasUpdate )   store.save ( name, k, inData[k] )
                                                else               store.save ( name, k, v )                        
                                        })
                        }
                    if ( breadcrumbs.includes('/') )   store.connect ([breadcrumbs])
                    return next ()
            }) // look
} // update func.



export default update


