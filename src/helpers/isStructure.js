'use strict'
/**
 *  Data of a dt-line is a plain object or an array.
 *  `dt.index` returns other values for primitives (e.g. `index('root/a')` for `{ a: 2 }` returns 2).
 *  @param {*} v - Data from `dt.index`
 *  @returns {boolean} True for data of a dt-line
 */
function isStructure ( v ) {
        if ( v instanceof Array )   return true
        return v !== null && typeof v === 'object' && Object.getPrototypeOf ( v ) === Object.prototype
} // isStructure func.



export default isStructure
