/**
 *  Testing compare operations
 * 
 */



import { expect } from "chai"
import dtbox from "dt-toolbox"
import {
           add   
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
})

it ( 'Overwrite' )
it ( 'Combine' )
it ( 'Append' )
it ( 'Prepend' )

}) // describe