'use strict'
/**
 *  Output paths of dt-lines, when a query moves array items to a new index.
 *  - Items of an array that have their own dt-line (objects and arrays) are
 *    placed by index. When a query removes values before them, they move;
 *  - A moved item takes its whole subtree with it;
 *  - `rename` gives a dt-line a new path (e.g. one level deeper). Its subtree goes with it;
 *  - Call `path` for each dt-line, parents first (the order of `look`).
 */
function pathMap () {
        const
              moves   = new Map ()   // Breadcrumbs of a moved array item -> its new index
            , changed = new Map ()   // Breadcrumbs -> output path, only when they are different
            ;

        function move ( arrayBreadcrumbs, index, newIndex ) {
                if ( index !== newIndex )   moves.set ( `${arrayBreadcrumbs}/${index}`, newIndex )
            } // move func.

        function rename ( breadcrumbs, newPath ) {
                changed.set ( breadcrumbs, newPath )
            } // rename func.

        function path ( breadcrumbs ) {
                if ( moves.size === 0 && changed.size === 0 )   return breadcrumbs
                const cut = breadcrumbs.lastIndexOf ( '/' );
                if ( cut < 0 )   return breadcrumbs
                const
                      parent     = breadcrumbs.slice ( 0, cut )
                    , parentPath = changed.get ( parent )
                    , isMoved    = moves.has ( breadcrumbs )
                    ;
                if ( !isMoved && parentPath === undefined )   return breadcrumbs
                const out = `${ parentPath ?? parent }/${ isMoved ? moves.get ( breadcrumbs ) : breadcrumbs.slice ( cut + 1 ) }`;
                changed.set ( breadcrumbs, out )
                return out
            } // path func.

        return { move, rename, path }
} // pathMap func.



export default pathMap
