# DT Queries

**Note**: Set of DT-toolbox query functions. You can use them for **learning purposes** or inspiration for how to build your own query functions for DT-Toolbox.


## How to use the library

Library is a list of functions and you can take only the needed one.

```js
import dtbox from 'dt-toolbox'
import { identical } from '@peter.naydenov/dt-queries'
// or require it:
// const identical = require ( '@peter.naydenov/dt-queries').identical;

const dt = dtbox.init ( a ) // a is some standard JS object
const result = dt.query ( identical, otherDtObject )  
// 'identiacal' query function expect one extra argument, that should be a dt-object
```





## Query functions

### Merge operations
- Add
- Update
- Overwrite
- Insert
- Append
- Prepend
- Combine



### Compare operations
- Identical
- Change
- Different
- Missing
- Same



### Extract operations
- Keep segments
- Remove segments



### Segment Operations
- SplitSegments: Splits a solid data into multiple data-segments;
- JoinSegments : Consolidate multiple data-segments in a single solid data;
- updateState  : Updates the state with new data. Takes only declared data-segments and root data properties;



## External Links
- [DT-toolbox](https://github.com/PeterNaydenov/dt-toolbox)


## Credits
'@peter.naydenov/dt-queries' was created and supported by Peter Naydenov.



## License
'@peter.naydenov/dt-queries' is released under the [MIT License](http://opensource.org/licenses/MIT).


