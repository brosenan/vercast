var assert = require('assert');
var DummyBucketStore = require('../dummyBucketStore.js');

var bucketStore = new DummyBucketStore();

describe('DummyBucketStore', function(){
    it('should accumulate all added items and replay them when fetched', function(done){
	var values = {one: 1, two: 2, three: 3};
	for(var key in values) {
	    bucketStore.add('myBucket', {key: key, value: values[key]});
	}
	bucketStore.fetch('myBucket', function(err, bucket) {
	    for(var i = 0; i < bucket.length; i++) {
		assert(bucket[i].key in values, 'the  bucket should only contain the added keys');
		delete values[bucket[i].key];
	    }
	    for(var k in values) assert(false, 'all values should have been removed');
	    done();
	});
    });
    it('should store each bucket individually', function(done){
	var values = {one: 1, two: 2, three: 3};
	for(var key in values) {
	    bucketStore.add('myBucket', {key: key, value: values[key]});
	    bucketStore.add('myOtherBucket', {key: 'other_' + key, value: values[key] + 2});
	}
	bucketStore.fetch('myBucket', function(err, bucket) {
	    for(var i = 0; i < bucket.length; i++) {
		assert(bucket[i].key in values, 'item ' + JSON.stringify(bucket[i]) + ' should not be in bucket');
	    }
	    done();
	});
    });

});
