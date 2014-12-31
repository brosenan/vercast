"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

function createOStore(dispMap) {
    var bucketStore = new vercast.DummyBucketStore();
    var disp = new vercast.ObjectDispatcher(dispMap);
    var storage = vercast.createBucketExtractionStorage(bucketStore, disp);

    var kvs = new vercast.DummyKeyValueStore();
    var seq = new vercast.SequenceStoreFactory(kvs);
    return new vercast.ObjectStore(disp, seq, storage);
}

describe('BucketExtractionStorage', function(){
    require('./describeObjectStore.js')(createOStore);
    //require('./describeObjectStore.js').describeCachedObjectStore(createOStore);
});
