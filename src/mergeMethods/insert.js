'use strict'
/**
 *   Insert: Extend available array structures only
 *    - use all data structures from the original;
 *    - take values from incoming data only if the original structure is an array;
 *    - if original data structure was changed, ignore it;
 *    - arrays - Extend existing array with the new values;
 *    - add new arrays if any;
 */


function insert ( storage, inData ) {
    const crumbs = [];
    storage.look ( ({ name, flatData, breadcrumbs, next }) => {
                const 
                      inRow = inData.index(breadcrumbs)
                    , isArray = flatData instanceof Array
                    ;
                crumbs.push ( breadcrumbs )
                if ( !inRow ) { //
                            storage.set ( name, flatData )
                            if ( breadcrumbs.includes('/') )   storage.connect([breadcrumbs])
                            return next ()
                    }
                const
                      [ , inFlat ] = inRow
                    , inIsArray = inFlat instanceof Array
                    , arr = isArray  ? [ ... flatData ] : []
                    ;
                
                if ( isArray ) {
                            if ( inIsArray ) {
                                        inFlat.forEach ( el => {
                                                        if ( !arr.includes(el) )   arr.push ( el )
                                                })
                                }
                            else {
                                        let inEntries = Object.entries ( inFlat );
                                        inEntries.forEach ( ([k,v]) => {
                                                        if ( !arr.includes(v) )   arr.push ( v )
                                                })
                                }
                            storage.set ( name, arr )
                    }
                else {
                            storage.set ( name, flatData )
                    }
                if ( breadcrumbs.includes('/') )   storage.connect([breadcrumbs])
                return next ()
        }) // look storage

    inData.query ( inStorage => {   // Fulfill the new structures from incoming data
                    inStorage.look (({name,flatData,breadcrumbs, next }) => {
                                    if ( !crumbs.includes(breadcrumbs) ) {
                                                let isArray = flatData instanceof Array;
                                                if ( isArray ) {  
                                                            storage.set ( name, flatData )
                                                            storage.connect([breadcrumbs])
                                                    }
                                        }
                                    return next ()
                            }) // look inStorage
        }) // query inData
} // insert func.



export default insert


