'use strict'


function keepSegments ( flatStore, keepRequest=[] ) {
        const segmentNames = [];
        let rootType;
        
        flatStore.use('root').look ( ({ name, flatData, next }) => {
                            segmentNames.push ( name )
                            if ( name === 'root' )   rootType = flatData instanceof Array ? 'array' : 'object'
                            return next ()
                    })
                    
        const 
                  keepList = segmentNames.filter ( name => keepRequest.includes ( name )   )
                , isSingleSegment = keepList.length === 1
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
} // keepSegments func.



export default keepSegments


