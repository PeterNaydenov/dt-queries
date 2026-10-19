'use strict'
/**
 *  Length of an array dt-line, items with own dt-lines included.
 *  An item at the end of an array (object or array) has no place in the array data:
 *  `[ 5, { k: 1 } ]` is stored as `[ 5 ]` and a child dt-line '1'.
 *  @param {Array} data - Array data of the dt-line
 *  @param {Set<number>} items - Indexes of the items with own dt-lines
 *  @returns {number} The length
 */
function arrayLength ( data, items ) {
        let length = data.length;
        items.forEach ( i => {  if ( i >= length )   length = i + 1   })
        return length
} // arrayLength func.



export default arrayLength
