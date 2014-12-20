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
    it('should retrieve an empty array for a bucket that has never been appended to', asyncgen.async(function*(){
	assert.deepEqual(yield* bucketStore.retrieve('bar'), []);
    }));
});
