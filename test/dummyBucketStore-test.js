"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var bucketStore = new vercast.DummyBucketStore();

describe('DummyBucketStore', function(){
    require('./describeBucketStore.js')(bucketStore);
    describe('async mode', function(){
	it('should work asynchronically if .async is set to true', asyncgen.async(function*(){
	    var bucketStore = new vercast.DummyBucketStore();
	    bucketStore.async = true;
	    
	    var id = 'ABCD';
	    yield* bucketStore.append(id, [{a:1}, {a:2}]);
	    yield* bucketStore.append(id, [{a:3}]);
	    yield* bucketStore.append(id, [{a:4}]);
	    assert.notDeepEqual(yield* bucketStore.retrieve(id), 
			     [{a:1}, {a:2}, {a:3}, {a:4}]);
	    yield function(_) { setTimeout(_, 3); };
	    assert.deepEqual(yield* bucketStore.retrieve(id), 
			     [{a:1}, {a:2}, {a:3}, {a:4}]);
	    
	}));

    });

});
