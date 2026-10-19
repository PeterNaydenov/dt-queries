/**
 *  Testing compare operations
 * 
 */



import { expect } from "chai"
import dtbox from "dt-toolbox"
import {
              change
            , different
            , identical
            , missing
            , same
      } from '../src/main.js'



const 
        a = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                                age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            }
        ;



describe ( 'Compare operations', () => {



it ( 'Identical. Fully identical', () => {
    // For identical objects function identical will return copy of the object
        const 
              flat = dtbox.init ( a, { model: 'std' })
            , d   = dtbox.flat  ( a, { model: 'std' })
            ;

        const 
              res = flat.query ( identical, dtbox.init(a) ) 
            , data = res.export ()
            ;

        expect ( res ).to.have.property ( 'insertSegment' )
        expect ( res ).to.have.property ( 'export' )
        expect ( res ).to.have.property ( 'copy' )
        expect ( res ).to.have.property ( 'model' )
        expect ( res ).to.have.property ( 'query' )
        expect ( res ).to.have.property ( 'listSegments' )

        data.forEach ( (line,i) => {
                    let 
                          [ name, fd, breadcrumbs, links ] = line
                        , [ uName, ufd, uBreadcrumbs, ulinks ] = d[i]
                        ;
                    expect ( name === uName )
                    expect ( breadcrumbs ).to.be.equal ( uBreadcrumbs ) 
                    if ( fd instanceof Array ) { // length of arrays should be the same
                            expect ( fd.length ).to.be.equal ( ufd.length )
                        }
                    let checkList = Object.keys ( fd );
                    checkList.forEach ( k => expect( fd[k]).to.be.equal (ufd[k])   )  // Same keys, same values
                    links.forEach ( (l,i) => expect(l).to.be.equal( ulinks[i])     )  // All links are available
            })
}) // it identical, fully identical



it ( 'Identical. Different objects', () => {
        // Extract only identical parts -> key/value pairs
        const 
              flat = dtbox.init ( a )
            , changed = {
                              name: 'Stefan'
                            , friends : [ 'Ivan', 'Miroslav' ]
                            , personal : {
                                              age     : 30
                                            , eyes    : 'blue'
                                            , sizes   : [ 10, 44, 'miss', 'mid' ]
                                            , hobbies : { 
                                                              music   : [ 'punk', 'ska', 'metal', 'guitar' ]
                                                            , sports  : [ 'fencing', 'skating', 'ski' ]
                                                        }
                                        }
                    }
            ;
        const 
              res = flat.query ( identical, dtbox.init(changed)   )
            , data = res.export ()
            ;
        let i = 0;
        data.forEach ( line => {
                            const [ name, fo,, links ] = line;
                            if ( name === 'root' ) {
                                        expect ( fo ).to.not.have.property ( 'name' )
                                        i++
                                }
                            if ( name === 'friends' ) {
                                        expect ( fo ).to.have.length ( 1 )
                                        i++
                                }
                            if ( name === 'hobbies' ) {
                                        expect ( links ).to.not.contains ( 'root/personal/hobbies/sport'  )
                                        expect ( links ).to.not.contains ( 'root/personal/hobbies/sports' )
                                        expect ( links ).to.contains     ( 'root/personal/hobbies/music'  )
                                        expect ( links ).to.have.length ( 1 )
                                        i++
                                }
                }) // forEach
        expect ( i ).to.be.equal ( 3 )
}) // it identical, different objects



it ( 'Change', () => {
        const 
              flat = dtbox.init ( a )
            , changed = {
                              name: 'Stefan'
                            , change : 'yes'
                            , friends : [ 'Ivan', 'Miroslav' ]
                            , personal : {
                                              age     : 30
                                            , eyes    : 'blue'
                                            , sizes   : [ 10, 44, 'miss', 'mid', 'mm']
                                            , hobbies : { 
                                                              music   : [ 'punk', 'ska', 'metal', 'guitar' ]
                                                            , sports  : [ 'fencing', 'skating', 'ski', 'running' ]
                                                            , photography : [ 'retouch', 'photoshop', 'portrait']
                                                        }
                                        }
                    }
            ;
        const 
              res  = flat.query ( change, dtbox.init(changed) )
            , data = res.export ()
            ;
        let 
              i = 0
            , sport = null
            ;
        data.forEach ( line => {
                    const [ name, fd ] = line;
                    if ( name === 'root' ) {
                                expect ( fd ).to.have.property ( 'name' )
                                expect ( fd.name ).to.be.equal ( 'Stefan')
                                expect ( fd ).to.not.have.property ( 'change' )
                                i++
                        }
                    if ( name === 'friends' ) {
                                expect ( fd ).to.have.length ( 2 )
                                expect ( fd ).to.contains ( 'Ivan' )
                                expect ( fd ).to.contains ( 'Miroslav' )
                                i++
                        }
                    if ( name === 'personal' ) {
                                expect ( fd ).to.have.property ( 'age' )
                                expect ( fd.age ).to.be.equal ( 30 )
                                expect ( fd ).to.not.have.property ( 'eyes' )
                                i++
                        }
                    if ( name === 'sports' )   sport = 'yes'
                    if ( name === 'sport'  ) {
                                expect ( fd ).to.have.length ( 0 )
                                i++
                        }
            })
        expect ( i ).to.be.equal ( 4 )
        expect ( sport ).to.be.null
}) // it change



it ( 'Different', () => {
        const 
              flat = dtbox.init ( a )
            , changed = {
                              name: 'Stefan'
                            , change : 'yes'
                            , friends : [ 'Ivan', 'Miroslav' ]
                            , personal : {
                                              age     : 30
                                            , eyes    : 'blue'
                                            , sizes   : [ 10, 44, 'miss', 'mid', 'mm']
                                            , hobbies : { 
                                                              music   : [ 'punk', 'ska', 'metal', 'guitar' ]
                                                            , sports  : [ 'fencing', 'skating', 'ski', 'running' ]
                                                            , photography : [ 'retouch', 'photoshop', 'portrait']
                                                        }
                                        }
                    }
            ;
        const res = flat.query ( different, dtbox.init(changed), flat.index );
        expect ( res.copy() ).to.deep.equal ({
                      name    : 'Stefan'                                        // Changed value
                    , change  : 'yes'                                           // New key
                    , friends : [ undefined, 'Miroslav' ]                       // Changed value keeps its place
                    , personal : {
                                      age   : 30                                // 'eyes' has no difference
                                    , sizes : [ undefined, undefined, 'miss', undefined, 'mm' ]
                                    , hobbies : {
                                                      music  : []               // Structure without differences
                                                    , sports : [ 'fencing', 'skating', 'ski', 'running' ]   // New structures come with all their data
                                                    , photography : [ 'retouch', 'photoshop', 'portrait' ]
                                                }
                                }
                })
}) // it different



it ( 'Missing', () => {
        const 
              flat = dtbox.init ( a )
            , changed = {
                              name: 'Stefan'
                            , change : 'yes'
                            , personal : {
                                              age     : 30
                                            , sizes   : [ 10, 44, 'miss', 'mid', 'mm']
                                            , hobbies : { 
                                                              music  : [ 'metal', 'guitar' ]
                                                            , sport  : [ 'fencing', 'skating', 'ski', 'running' ]
                                                            , photography : [ 'retouch', 'photoshop', 'portrait']
                                                        }
                                        }
                    }
            ;
        const 
              res  = flat.query ( missing, dtbox.init(changed), flat.index )
            , data = res.export ()
            ;
        let i = 0;
        data.forEach ( line => {
                      const [ name, fd ] = line;

                      if ( name === 'root' ) {
                                  let props = Object.keys(fd);
                                  expect ( props ).to.have.length ( 0 )
                                  i++
                          }
                      if ( name === 'personal' ) {
                                  expect ( fd ).to.have.property ( 'eyes' )
                                  expect ( fd.eyes ).to.be.equal ( 'blue' )
                                  expect ( fd ).to.not.have.property ( 'age' ) 
                                  i++
                          }
                      if ( name === 'music' ) {
                                  expect ( fd ).to.contains ( 'punk' )
                                  expect ( fd ).to.contains ( 'ska'  )
                                  i++
                          }
                      if ( name === 'sizes' ) {
                                  expect ( fd ).to.contains ( 'm' )
                                  i++
                          }
            })
      expect ( i ).to.be.equal ( 4 )
}) // it Missing



it ( 'Same', () => {
  /**
   *   Keeps the structure of the original data, takes primitive values from the update.
   *  - keys and array lengths stay as in the original
   *  - new keys and structures of the update are not applied
   */
        const 
              flat = dtbox.init ( a )
            , changed = {
                              change : 'yes'
                            , personal : {
                                              age     : 30
                                            , eyes    : 'blue'
                                            , sizes   : [ 10, 44, 'miss', 'mid', 'mm']
                                            , hobbies : { 
                                                              music  : [ 'metal', 'guitar' ]
                                                            , sports : [ 'fencing', 'skating', 'ski', 'running' ]
                                                            , photography : [ 'retouch', 'photoshop', 'portrait']
                                                        }
                                        }
                    }
            ;
      const res = flat.query ( same, dtbox.init(changed) );
      expect ( res.copy() ).to.deep.equal ({
                    name: 'Peter'                                          // No update: original value
                  , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]            // No update: original array
                  , personal : {
                                    age     : 30
                                  , eyes    : 'blue'
                                  , sizes   : [ 10, 44, 'miss', 'mid' ]   // Same length, values on the same place
                                  , hobbies : {
                                                    music : [ 'metal', 'guitar', 'metal', 'guitar' ]   // Shorter update: the rest stays
                                                  , sport : [ 'fencing', 'skating', 'ski' ]            // 'sports' and 'photography' are new
                                              }
                              }
              })                                                        // 'change' is a new key
}) // it same

}) // describe