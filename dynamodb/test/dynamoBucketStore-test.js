"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var bucketStore = new vercast.DynamoBucketStore('TestBucketStore', 'us-east-1');

describe('DynamoBucketStore', function(){
    require('../../test/describeBucketStore.js')(bucketStore);
});
