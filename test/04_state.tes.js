/**
 *  Testing state related operations: 
 *   - splitSegments: Break a solid data into multiple data-segments; 
 *   - joinSegments: Consolidate multiple data-segments in a single solid data;
 *   - stateUpdate: Update state for existing segments only + root segment properties;
 * 
 */



import { expect } from "chai"
import dtbox from "dt-toolbox"
import { splitSegments, joinSegments, updateState } from '../src/main.js'




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



describe ( 'Segment operations', () => {



it ( 'Split to segments', () => {    
      const 
          r = dtbox.init ( a ).query ( splitSegments )
        , segments = r.listSegments()
        , [ personal ] = r.extractList ( ['personal'],{ as: 'std'})
        ;
      expect ( segments ).to.be.an ( 'array' )
      expect ( segments ).to.have.lengthOf ( 3 )
      expect ( segments ).to.deep.equal ([ 'root', 'friends', 'personal' ])
      expect ( personal.hobbies ).to.have.property ( 'music' )
      expect ( personal.hobbies ).to.have.property ( 'sport' ) 
}) // it split segments



it ( 'Double segments split == single segments split', () => {    
      const 
            r  = dtbox.init ( a ).query ( splitSegments )
          , r1 = r.export ()                         // Export after first split
          , r2 = r.query ( splitSegments ).export () // Export after second split
        ;
      expect ( r1 ).to.deep.equal ( r2 ) // Expect no difference
}) // it split segments



it ( 'Join segments', () => {
    const 
          r = dtbox.init ( a ).query ( splitSegments ).query ( joinSegments )
        , segments = r.listSegments()
        , data = r.model ( () => ({as: 'std'}))
        ;
    expect ( segments ).to.have.lengthOf ( 1 )
    expect ( segments ).to.deep.equal ([ 'root' ])
    expect ( data.personal.hobbies ).to.have.property ( 'music' )
    expect ( data.personal.hobbies ).to.have.property ( 'sport' )
}) // it join segments



it ( 'Update state', () => {
    const state = dtbox.init ( { name: 'Peter' });
    state.insertSegment ( 'personal', dtbox.init(a.personal))

    const changes = dtbox.init ({ name:'Ivan', age:48 });
    changes.insertSegment ( 'friends', dtbox.init(a.friends))

    const [ personalChanges ] = state.extractList(['personal'], { as: 'std' });
    personalChanges.hobbies.collections = [ 'stones', 'coins']
    personalChanges.eyes = 'green'
    changes.insertSegment ( 'personal', dtbox.init(personalChanges))

    const result = state
                       .query ( updateState, changes )
                       .query ( joinSegments )
                       .model( () => ({as:'std'}) )

    expect ( result.name ).to.be.equal ( 'Ivan' )
    expect ( result.age ).to.be.undefined
    expect ( result.personal.age ).to.be.equal ( 49 )
    expect ( result.personal.eyes ).to.be.equal ( 'green' )
    expect ( result.personal.hobbies.collections ).to.have.lengthOf ( 2 )
}) // it update state


}) // describe


