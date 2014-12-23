"use strict";

var vercast = require('vercast');

module.exports = function(bucketStore, createBucket) {
    var buckets = Object.create(null);
    var emits = Object.create(null);

    this.deriveContext = function(ctx, v, p) {
	var split = v.split('-');
	if(split[0] === ctx.bucket) {
	    return ctx;
	} else {
	    var pHash = vercast.ObjectMonitor.seal(p);
	    return {bucket: split[0],
		    originator: [split[1], pHash].join('-')};
	}
    };
    function bucketID(v) {
	return v.split('-')[0];
    }
    this.storeNewObject = function*(ctx, obj) {
	var bucket = yield* getBucket(ctx.bucket);
	return [ctx.bucket, bucket.store(obj, emitFunc(ctx))].join('-');
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

    function emitionKey(ctx) {
	return [ctx.bucket, ctx.originator].join('-');
    }
    function emitFunc(ctx) {
	var key = emitionKey(ctx);
	return function (elem) {
	    var emitsForBucket = emits[key];
	    if(!emitsForBucket) {
		emitsForBucket = [];
		emits[key] = emitsForBucket;
	    }
	    emitsForBucket.push(elem);
	};
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
	    var childCtx = this.deriveContext(ctx, v1, p);
	    internalID = targetBucket.storeIncoming(v1, p, monitor, r, eff, emitFunc(childCtx));
	    var key = emitionKey(childCtx);
	    if(emits[key]) {
		emits[key].forEach(function(elem) {
		    targetBucket.add(elem);
		});
		yield* bucketStore.append(targetBucketID, emits[key]);
		delete emits[key];
	    }
	}
	return [targetBucketID, internalID].join('-');
    };
    this.retrieve = function*(ctx, id) {
	var split = id.split('-');
	var bucket = yield* getBucket(split[0]);
	return bucket.retrieve(split[1]);
    };
};