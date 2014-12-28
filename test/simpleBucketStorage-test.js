"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

function createOStore(dispMap) {
    var bucketStore = new vercast.DummyBucketStore();
    var storage = vercast.createSimpleBucketStorage(bucketStore);

    var disp = new vercast.ObjectDispatcher(dispMap);
    var kvs = new vercast.DummyKeyValueStore();
    var seq = new vercast.SequenceStoreFactory(kvs);
    return new vercast.ObjectStore(disp, seq, storage);
}

describe('SimpleBucketStorage', function(){
    require('./describeObjectStore.js')(createOStore);
    require('./describeObjectStore.js').describeCachedObjectStore(createOStore);
});
