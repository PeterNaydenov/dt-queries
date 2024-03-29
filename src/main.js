'use strict'

/*
    DT-Toolbox Queries
    =======================
    
    Version 1.0.0

    History notes:
     - Started on May 12th, 2023.
        * Includes object compare queries
        * Includes dt-model merge queries
*/





import change    from './compareMethods/change.js'
import different from './compareMethods/different.js'
import identical from './compareMethods/identical.js'
import missing   from './compareMethods/missing.js'
import same      from './compareMethods/same.js'

import add       from './mergeMethods/add.js'
import append    from './mergeMethods/append.js'
import combine   from './mergeMethods/combine.js'
import insert    from './mergeMethods/insert.js'
import update    from './mergeMethods/update.js'
import overwrite from './mergeMethods/overwrite.js'
import prepend   from './mergeMethods/prepend.js'

import keepSegments   from './extractMethods/keepSegments.js'
import removeSegments from './extractMethods/removeSegments.js'

import joinSegments  from './state/joinSegments.js'
import splitSegments from './state/splitSegments.js'
import updateState   from './state/updateState.js'



export {
            // Merge queries
              add
            , append
            , insert
            , overwrite
            , prepend
            , update
            , combine

            // Compare queries
            , change
            , different
            , identical
            , missing
            , same

            // Extract queries
            , keepSegments
            , removeSegments

            // State queries
            , joinSegments
            , splitSegments
            , updateState
        }
 

