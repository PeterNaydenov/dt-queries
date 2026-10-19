'use strict'


function removeSegments ( flatStore, removeRequest=[] ) {
        const keepList = [];
        let rootType;
        
        flatStore
            .use ( 'root' )
            .look ( ({ name, flatData, next }) => {
                            if ( !removeRequest.includes(name) )   keepList.push ( name )
                            if ( name === 'root' )   rootType = flatData instanceof Array ? 'array' : 'object'
                            return next ()
                    })
                    
        const 
                  isSingleSegment = keepList.length === 1
                , noRoot = !isSingleSegment && !keepList.includes ( 'root' )   // No segments, or more segments without the 'root': the 'root' is empty
                ;
        if ( noRoot )   ( rootType === 'array' ) ? flatStore.set ( 'root', [] ) : flatStore.set ( 'root', {} )

        keepList.forEach ( segment => {
                const prefix = `${segment}/`;
                flatStore
                   .from ( segment )
                   .look ( ({ flatData, breadcrumbs, next  }) => {
                                        let path = breadcrumbs;
                                        if ( isSingleSegment ) {   // A single segment becomes the 'root'
                                                    path = ( breadcrumbs === segment ) ? 'root' : `root/${breadcrumbs.slice ( prefix.length )}`
                                            }
                                        flatStore.set ( path, flatData )
                                        return next ()
                        })
            })
} // removeSegments func.



export default removeSegments


