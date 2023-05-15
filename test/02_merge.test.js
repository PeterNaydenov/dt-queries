/**
 *  Testing compare operations
 * 
 */



import { expect } from "chai"
import dtbox from "dt-toolbox"
import {
             add   
           , update
           , overwrite
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



describe ( 'Merge operations', () => {



it ( 'Add', () => {
  /**
   *   Add: Result will have original data untouched and insert only new props
   */
        const 
              d   = dtbox.flat ( a )
            , flat = dtbox.init ( a )
            , changed = {
                              name: 'Stefan'
                            , friends : [ 'Miroslav' ]
                            , change : 'yes'
                            , personal : {
                                              age     : 30
                                            , sizes   : [ 10, 44, 'miss', 'mid', 'mm']
                                            , hobbies : { 
                                                              music  : [ 'industrial' ]
                                                            , sport  : [ 'fencing', 'skating', 'ski', 'running' ]
                                                            , photography : [ 'retouch', 'photoshop', 'portrait']
                                                        }
                                        }
                    }
            ;
        const 
              res  = flat.query ( add, dtbox.init(changed), flat.index )
            , data = res.export ()
            ;
        let i = 0;
        data.forEach ( line => {
                    const [ name, fd, breadcrumbs, edges ] = line;

                    if ( name === 'root' ) {
                              expect ( fd.name ).to.be.equal ( 'Peter' )
                              expect ( fd ).to.have.property ( 'change' )
                              i++
                        }
                    if ( name === 'friends' ) {
                              expect ( fd ).to.contains ( 'Dobroslav' )
                              expect ( fd ).to.contains ( 'Miroslav' )
                              i++
                        }
                    if ( name === 'sizes' ) {
                              expect ( fd ).to.have.length ( 6 )
                              i++
                        }
                    if ( name === 'hobbies' ) {
                              expect ( edges ).to.contains ( 'root/personal/hobbies/photography' )
                              i++
                        }
            }) // forEach data
        expect ( i ).to.be.equal ( 4 )
}) // it add




it ( 'Update', () => {
  /**
   *   Update: Result will ignore all new props and will update existing ones.
   */
  const 
          flat = dtbox.init ( a )
        , changed = {
                          name: 'Stefan'
                        , friends : [ 'Miroslav' ]
                        , change : 'yes'
                        , personal : {
                                          age     : 30
                                        , hobbies : { 
                                                          sport  : [ 'ski', 'fencing', 'skating', 'running' ]
                                                        , photography : [ 'retouch', 'photoshop', 'portrait']
                                                    }
                                    }
                }
        ;
  const 
        res  = flat.query ( update, dtbox.init(changed)   )
      , data = res.model ( () => ({as:'std'}))
      ;

  expect ( data.name ).to.be.equal ( 'Stefan' )
  expect ( data ).to.not.have.property ( 'change' )
  expect ( data.friends ).to.have.length ( 1 )
  expect ( data.friends ).to.contains ( 'Miroslav' )

  expect ( data.personal).to.have.property ( 'eyes' )
  expect ( data.personal).to.have.property ( 'sizes' )
  expect ( data.personal).to.have.property ( 'hobbies' )

  expect ( data.personal.hobbies ).to.have.property ( 'music')
  expect ( data.personal.hobbies ).to.have.property ( 'sport')
  expect ( data.personal.hobbies ).to.not.have.property ( 'photography' )

  expect ( data.personal.hobbies.sport ).to.have.length ( 4 )
  expect ( data.personal.hobbies.sport[0] ).to.be.equal ( 'ski' )
  expect ( data.personal.hobbies.music ).to.have.length ( 4 )
})



it.only ( 'Overwrite', () => {
  /**
   *   Overwrite: Result will add all new props and will update existing ones.
   */
  const 
          flat = dtbox.init ( a )
        , changed = {
                          name: 'Stefan'
                        , friends : [ '...','Miroslav' ] // if first element is equal to '...', existing array should be extended 
                        , change : 'yes'
                        , personal : {
                                          age     : 30
                                        , hobbies : { 
                                                          sport  : [ 'running' ] // first element is not empty, so array will be overwritten
                                                        , photography : [ 'retouch', 'photoshop', 'portrait']
                                                    }
                                    }
                }
        ;
  const 
        res  = flat.query ( overwrite, dtbox.init(changed)   )
      , data = res.model ( () => ({as:'std'}))
      , { music, sport, photography } = data.personal.hobbies
      ;

  expect ( data.name ).to.be.equal ( 'Stefan' )
  expect ( data ).to.have.property ( 'change' )
  expect ( data.friends ).to.have.length ( 4 ) // Should be extended because the first element is '...'

  expect ( data.personal.age ).to.be.equal ( 30 )
  expect ( data.personal.eyes ).to.be.equal ( 'blue' )
  expect ( data.personal ).to.have.property ( 'sizes' )

  expect ( sport ).to.have.length ( 1 )
  expect ( sport[0] ).to.be.equal ( 'running' )
  expect ( photography ).to.have.length ( 3 )
  expect ( music ).to.have.length ( 4 )
}) // it overwrite



it ( 'Combine' )
it ( 'Append' )
it ( 'Prepend' )

}) // describe