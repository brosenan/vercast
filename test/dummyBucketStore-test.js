"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var bucketStore = new vercast.DummyBucketStore();

describe('DummyBucketStore', function(){
    require('./describeBucketStore.js')(bucketStore);
});
