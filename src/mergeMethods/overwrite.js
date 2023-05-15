'use strict'
/**
 *   Overwrite: Update + add new structures and key/values
 *    - use all data structures from the original;
 *    - take values and new structures from incoming data;
 *    - if original data structure was changed, use the incoming structure;
 *    - arrays - incoming array starts with '...' -> extend existing array with new values;
 *    - arrays - first element is not '...' -> overwrite the array
 */


function overwrite ( storage, inData ) {
    const crumbs = [];
    storage.look ( ({ name, flatData, breadcrumbs}) => {
                const 
                      inRow = inData.index(breadcrumbs)
                    , isArray = flatData instanceof Array
                    ;
                crumbs.push ( breadcrumbs )
                if ( !inRow ) { //
                            storage.set ( name, flatData )
                            if ( breadcrumbs.includes('/') )   storage.connect([breadcrumbs])
                            return 'next'
                    }
                const
                      [ , inFlat ] = inRow
                    , inIsArray = inFlat instanceof Array
                    ;
                if ( isArray !== inIsArray ) {   // If change in data-structure
                            storage.set ( name, inFlat )
                    }
                else if ( isArray ) {  // If both are arrays
                            if ( inFlat[0] == '...' ) { // if first element of incoming array is empty -> extend the existing array.
                                        let arr = [ ... flatData ];
                                        inFlat.forEach ( el => {
                                                        if ( el == '...' )   return
                                                        if ( !arr.includes(el) )   arr.push ( el )
                                                })
                                        storage.set ( name, arr )
                                }
                            else {     // Overwrite the array
                                        storage.set ( name, inFlat )
                                }
                    }
                else {   // objects. Set key/values
                            let 
                                  obj = { ... flatData }
                                , inEntries = Object.entries( inFlat )
                                ;
                            inEntries.forEach ( ([k,v]) =>  obj[k] = v   )
                            storage.set ( name, obj )
                    }
                if ( breadcrumbs.includes('/') )   storage.connect([breadcrumbs])
                return 'next'
        }) // look storage

    inData.query ( inStorage => {   // Fulfill the new structures from incoming data
                    inStorage.look (({name,flatData,breadcrumbs}) => {
                                    if ( !crumbs.includes(breadcrumbs) ) {
                                                storage.set ( name, flatData )
                                                storage.connect([breadcrumbs])
                                        }
                                    return 'next'
                            }) // look inStorage
        }) // query inData
} // overwrite func.



export default overwrite


