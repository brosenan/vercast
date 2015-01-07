"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var bucketStore = new vercast.DummyBucketStore();

describe('DummyBucketStore', function(){
    beforeEach(asyncgen.async(function*() {
	yield* bucketStore.clear();
    }));
    it('should retrieve, all at once, the elements that were individually appended to a given bucket', asyncgen.async(function*(){
	yield* bucketStore.append('foo', [{a:1}, {a:2}]);
	yield* bucketStore.append('foo', [{a:3}]);
	yield* bucketStore.append('foo', [{a:4}]);
	assert.deepEqual(yield* bucketStore.retrieve('foo'), 
			 [{a:1}, {a:2}, {a:3}, {a:4}]);
    }));
    describe('.append(bucketName, elements)', function(){
	it('should return a time-uuid corresponding with this transaction', asyncgen.async(function*(){
	    var tuid1 = yield* bucketStore.append('foo', [{a:1}, {a:2}]);
	    var tuid2 = yield* bucketStore.append('foo', [{a:3}, {a:4}]);
	    assert(tuid1 < tuid2, tuid1 + " < " + tuid2);
	}));

    });
    describe('.retrieve(bucketName[, tuid[, giveTUID]])', function(){
	it('should retrieve an empty array for a bucket that has never been appended to', asyncgen.async(function*(){
	    assert.deepEqual(yield* bucketStore.retrieve('bar'), []);
	}));
	it('should only return elements that correspond to tuid greater than the given one, if given', asyncgen.async(function*(){
	    yield* bucketStore.append('foo', [{a:1}, {a:2}]);
	    var tuid = yield* bucketStore.append('foo', [{a:3}]);
	    yield* bucketStore.append('foo', [{a:4}]);
	    assert.deepEqual(yield* bucketStore.retrieve('foo', tuid), 
			     [{a:4}]);
	    
	}));
	it('should return an object: {elems, tuid} if giveTUID is true', asyncgen.async(function*(){
	    yield* bucketStore.append('foo', [{a:1}, {a:2}]);
	    var res = yield* bucketStore.retrieve('foo', '', true);
	    yield* bucketStore.append('foo', [{a:3}]);
	    yield* bucketStore.append('foo', [{a:4}]);
	    assert.deepEqual(yield* bucketStore.retrieve('foo', res.tuid), 
			     [{a:3}, {a:4}]);
	}));

    });
});
