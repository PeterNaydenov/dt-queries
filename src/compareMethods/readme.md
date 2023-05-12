




```js

/**
     *   Identical
     *   1. Use official data to work with.
     *   2. Search in update if have same key/vals
     *   3. Create a new structure with identical both - keys and vals;
     * 
     * 
     *   Change - What is changed in compare operation ( keys are from official data. No new data )
     *   1. Use official data to work with;
     *   2. Search in update if have same keys;
     *   3. Create a new structure with key/vals where vals are changed;
     * 
     * 
     *   Same - Keys that are available in both data-structures. Values are from new data.
     *   1. Use official data to work with;
     *   2. Search for keys in update
     *   3. Create a new structure with key/vals from update no matter of the value;
     * 
     * 
     * 
     *   Different - Only new keys and structures, that in official data are not available
     *   1. Work with update;
     *   2. Find if official data have the key/val;
     *   3. Create a new structure with key/vals that are not available in official data;
     * 
     * 
     *   Missing - 
     *   1. Use official data to work with;
     *   2. Search for key/values in update; 
     *   3. Create a new structure that will have data that update don't have;
     * 
     * 
     * 
     */

```