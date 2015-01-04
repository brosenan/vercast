"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

function createOStore(dispMap) {
    var bucketStore = new vercast.DummyBucketStore();
    var disp = new vercast.ObjectDispatcher(dispMap);
    var createBucket = vercast.createValidatingBucket(vercast.createExtractingBucket(disp));
    var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);

    var kvs = new vercast.DummyKeyValueStore();
    var seq = new vercast.SequenceStoreFactory(kvs);
    return new vercast.ObjectStore(disp, seq, storage);
}

function createOStoreNoValidate(dispMap) {
    var bucketStore = new vercast.DummyBucketStore();
    var disp = new vercast.ObjectDispatcher(dispMap);
    var createBucket = vercast.createExtractingBucket(disp);
    var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);

    var kvs = new vercast.DummyKeyValueStore();
    var seq = new vercast.SequenceStoreFactory(kvs);
    return new vercast.ObjectStore(disp, seq, storage);
}

describe('BucketExtractionStorage', function(){
    require('./describeObjectStore.js')(createOStore);
    require('./describeObjectStore.js').describeCachedObjectStore(createOStoreNoValidate);
    it('should store child objects in the same bucket as the parent', asyncgen.async(function*(){
	var dispMap = {
	    foo: {
		init: function*(ctx, args) { this.bar = null; },
		createBar: function*(ctx, p, u) {
		    this.bar = yield* ctx.init('bar', {});
		    return this.bar;
		},
	    },
	    bar: {
		init: function*(ctx, args) {},
	    },
	};
	var ostore = createOStoreNoValidate(dispMap);
	var foo = yield* ostore.init('foo', {});
	var res = yield* ostore.trans(foo, {_type: 'createBar'});
	assert.equal(res.r.$.split('-')[0], foo.$.split('-')[0]);
    }));
});

