"use strict";
module.exports = function(bucketStore, createBucket) {
    var buckets = Object.create(null);

    this.deriveContext = function(ctx, v, p) {
	var bucket = v.split('-')[0];
	return {bucket: bucket};
    };
    this.storeNewObject = function*(ctx, obj) {
	var bucket = yield* getBucket(ctx.bucket);
	return [ctx.bucket, bucket.store(obj)].join('-');
    };
    function* getBucket(id) {
	var bucket = buckets[id];
	if(!bucket) {
	    bucket = createBucket();
	    buckets[id] = bucket;
	}
	return bucket;
    }
};