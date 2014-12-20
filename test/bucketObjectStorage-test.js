"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var bucketStore = new vercast.DummyBucketStore();

describe('BucketObjectStorage', function(){
    beforeEach(asyncgen.async(function*() {
	yield* bucketStore.clear();
    }));
    it('should create a new bucket object by calling createBucket() when using a new bucket ID', asyncgen.async(function*(){
	var called = false;
	function createBucket() {
	    called = true;
	    return {
		store: function() {},
	    };
	}
	var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	yield* storage.storeNewObject({bucket: 'xyz'}, {_type: 'someObject'});
	assert(called, 'should be called');

	called = false;
	yield* storage.storeNewObject({bucket: 'xyz'}, {_type: 'someOtherObject'});
	assert(!called, 'should not have been called again');
    }));

    describe('.deriveContext(ctx, v, p)', function(){
	it('should store the version\'s bucket ID in  the context', asyncgen.async(function*(){
	    var storage = new vercast.BucketObjectStorage();
	    var newCtx = storage.deriveContext({}, "1234-5678", {});
	    assert.equal(newCtx.bucket, '1234');
	}));
   });
    describe('.storeNewObject(ctx, obj)', function(){
	it('should invoke the .store() method of the corresponding bucket object ', asyncgen.async(function*(){
	    var called = false;
	    var theObjectToCreate = {_type: 'obj', x: 42};
	    function createBucket() {
		return {
		    store: function(obj) {
			called = true;
			assert.deepEqual(obj, theObjectToCreate);
			return 'foo';
		    },
		};
	    }
	    var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	    var id = yield* storage.storeNewObject({bucket: 'abcd'}, theObjectToCreate);
	    assert(called, 'should have been called');
	    assert.equal(id, 'abcd-foo');
	}));
    });
});
