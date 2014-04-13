var assert = require('assert');
var DummyBucketStore = require('../dummyBucketStore.js');


describe('DummyBucketStore', function(){
    it('should accumulate all added items and replay them when fetched', function(done){
	var bucketStore = new DummyBucketStore();
	// Add values to the bucket
	var values = {one: 1, two: 2, three: 3};
	for(var key in values) {
	    bucketStore.add('myBucket', {key: key, value: values[key]});
	}
	// Trigger a fetch
	bucketStore.fetch('myBucket', function(err, item) {
	    assert(item.key in values, 'the  bucket should only contain the added keys');
	    delete values[item.key];
	    if(isEmpty(values)) done();
	});
    });
    it('should store each bucket individually', function(done){
	var bucketStore = new DummyBucketStore();
	var values = {one: 1, two: 2, three: 3};
	for(var key in values) {
	    bucketStore.add('myBucket', {key: key, value: values[key]});
	    bucketStore.add('myOtherBucket', {key: 'other_' + key, value: values[key] + 2});
	}
	bucketStore.fetch('myBucket', function(err, item) {
	    assert(item.key in values, 'item ' + JSON.stringify(item) + ' should not be in bucket');
	    delete values[item.key];
	    if(isEmpty(values)) done();
	});
    });
    function isEmpty(obj) {
	for(var k in obj) return false; 
	return true;
    }
});
