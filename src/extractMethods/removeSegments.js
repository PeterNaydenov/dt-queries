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
                  noSegments = keepList.length === 0
                , isSingleSegment = keepList.length === 1
                ;
        if ( noSegments )   ( rootType === 'array' ) ? flatStore.set ( 'root', [] ) : flatStore.set ( 'root', {} )

        keepList.forEach ( name => {
                let linksBuf = [];
                flatStore
                   .from ( name )
                   .look ( ({ name, flatData, breadcrumbs,links,next  }) => {
                                        if ( name === breadcrumbs && isSingleSegment )   flatStore.set ( 'root', flatData )
                                        else                                             flatStore.set ( name  , flatData )
                                        const ls = isSingleSegment ? links.map ( ([k,v]) => `root/${v}`) : links.map ( ([k,v]) => `${k}/${v}`);
                                        linksBuf = [ ...linksBuf, ...ls ]
                                        return next ()
                        })
                flatStore.connect ( linksBuf )
            })
} // removeSegments func.



export default removeSegments


