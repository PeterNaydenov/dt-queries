'use strict'
/**
 *   Prepend: Keep only original keys and change value if incoming data has same key. New value is prepended.
 *    - use all data structures from the original;
 *    - combine incoming and original values for equal keys;
 *    - if original data structure was changed, ignore that change;
 *    - arrays - Extend existing array with the new values;
 */


function prepend ( storage, inData ) {
    storage.look ( ({ name, flatData, breadcrumbs, next }) => {
                const 
                      inRow = inData.index(breadcrumbs)
                    , isArray = flatData instanceof Array
                    ;

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
                
                if ( isArray != inIsArray ) {
                            storage.set ( name, inFlat )
                    }
                else if ( isArray ) {
                            let inEntries = Object.entries ( inFlat );
                            inEntries.forEach ( ([k,v]) => {
                                            if ( !arr.includes(v) )   arr.push ( v )
                                    })
                            storage.set ( name, arr )
                    }
                else {
                            const 
                                  entries = Object.entries ( flatData )
                                , obj = {}
                                ;
                            entries.forEach ( ([k,v]) => {
                                        if ( inFlat.hasOwnProperty(k) )   obj[k] = `${inFlat[k]},${v}`
                                        else                              obj[k] = v
                                    })
                            storage.set ( name, obj )
                    }
                if ( breadcrumbs.includes('/') )   storage.connect([breadcrumbs])
                return next ()
        }) // look storage
} // prepend func.



export default prepend


