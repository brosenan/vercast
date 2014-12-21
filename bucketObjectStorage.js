"use strict";

var uuid = require('node-uuid');

module.exports = function(bucketStore, createBucket) {
    var buckets = Object.create(null);

    this.deriveContext = function(ctx, v, p) {
	var bucket = bucketID(v);
	if(bucket === ctx.bucket) {
	    return ctx;
	} else {
	    return {bucket: bucket, 
		    tuid: uuid.v1()};
	}
    };
    function bucketID(v) {
	return v.split('-')[0];
    }
    this.storeNewObject = function*(ctx, obj) {
	var bucket = yield* getBucket(ctx.bucket);
	return [ctx.bucket, bucket.store(obj)].join('-');
    };
    function* getBucket(id) {
	var bucket = buckets[id];
	if(!bucket) {
	    bucket = createBucket();
	    buckets[id] = bucket;
	    var elements = yield* bucketStore.retrieve(id);
	    elements.forEach(function(elem) {
		bucket.add(elem);
	    });
	}
	return bucket;
    }

    this.storeVersion = function*(ctx, v1, p, monitor, r, eff) {
	var ctxBucket = yield* getBucket(ctx.bucket);
	var targetBucketID = bucketID(v1);
	var internalID;
	if(targetBucketID === ctx.bucket) {
	    internalID = ctxBucket.storeInternal(v1, p, monitor, r, eff);
	} else {
	    var targetBucket = yield* getBucket(targetBucketID);
	    ctxBucket.storeOutgoing(v1, p, monitor, r, eff);
	    internalID = targetBucket.storeIncoming(v1, p, monitor, r, eff);
	}
	return [targetBucketID, internalID].join('-');
    };
    this.retrieve = function*(ctx, id) {
	var split = id.split('-');
	var bucket = yield* getBucket(split[0]);
	return bucket.retrieve(split[1]);
    };
};