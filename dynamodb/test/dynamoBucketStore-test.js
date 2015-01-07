"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var bucketStore = new vercast.DynamoDBBucketStore('TestBucketStore', 'us-east-1');

describe('DynamoDBBucketStore', function(){
    require('../../test/describeBucketStore.js')(bucketStore);
});
