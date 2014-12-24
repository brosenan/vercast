"use strict";

var vercast = require('vercast');

module.exports = function(bucketStore, createBucket, options) {
    var buckets = Object.create(null);
    var bucketSizes = Object.create(null);
    var emits = Object.create(null);
    options = options || {};
    var maxBucketSize = options.maxBucketSize || 100;

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
	var bucketID = ctx.bucket;
	var emit = emitFunc(ctx);
	var emits = [];
	if(bucketSizes[bucketID] >= maxBucketSize) {
	    var monitor = new vercast.ObjectMonitor(obj);
	    bucketID = monitor.hash();
	    emit = function(elem) {
		emits.push(elem);
	    }
	}
	var bucket = yield* getBucket(bucketID);
	var internalID = bucket.store(obj, emit);
	emits.forEach(function(elem) {
	    bucket.add(elem);
	});
	yield* bucketStore.append(bucketID, emits);
	return [bucketID, internalID].join('-');
    };
    function* getBucket(id) {
	var bucket = buckets[id];
	if(!bucket) {
	    bucket = createBucket();
	    buckets[id] = bucket;
	    bucketSizes[id] = 0;
	    var elements = yield* bucketStore.retrieve(id);
	    elements.forEach(function(elem) {
		bucket.add(elem);
	    });
	}
	bucket.name = id;
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

    function replaceBucketID(v, id) {
	return [id, v.split('-')[1]].join('-');
    }
    
    function copyObject(internalID, bucketFrom, bucketTo, emit) {
	var monitor = bucketFrom.retrieve(internalID);
	var obj = copyMembers(monitor.object(), bucketFrom, bucketTo, emit);
	return bucketTo.store(obj, emit);
    }

    function copyMembers(objIn, bucketFrom, bucketTo, emit) {
	var objOut = Object.create(null);
	Object.keys(objIn).forEach(function(key) {
	    if(typeof objIn[key] === 'object') {
		if('$' in objIn[key]) {
		    var split = objIn[key].$.split('-');
		    if(split[0] === bucketFrom.name) {
			objOut[key] = {$: bucketTo.name + '-' + copyObject(split[1], bucketFrom, bucketTo, emit)};
		    } else {
			objOut[key] = objIn[key];
		    }
		} else {
		    objOut[key] = copyMembers(objIn[key], bucketFrom, bucketTo, emit);
		}
	    } else {
		objOut[key] = objIn[key];
	    }
	});
	return objOut;
    }

    this.storeVersion = function*(ctx, v1, p, monitor, r, eff) {
	var ctxBucket = yield* getBucket(ctx.bucket);
	var internalID;
	var oldInternalID = v1.split('-')[1];
	var targetBucketID = bucketID(v1);
	if(targetBucketID === ctx.bucket) {
	    internalID = ctxBucket.storeInternal(v1, p, monitor, r, eff);
	} else {
	    var childCtx = this.deriveContext(ctx, v1, p);
	    var targetBucket = yield* getBucket(targetBucketID);
	    ctxBucket.storeOutgoing(v1, p, monitor, r, eff, emitFunc(ctx));
	    internalID = targetBucket.storeIncoming(v1, p, monitor, r, eff, emitFunc(childCtx));
	    var key = emitionKey(childCtx);
	    if(emits[key]) {
		if(internalID !== oldInternalID) {
		    emits[key].forEach(function(elem) {
			targetBucket.add(elem);
		    });
		    yield* bucketStore.append(targetBucketID, emits[key]);
		    bucketSizes[targetBucketID] += emits[key].length;
		}
		delete emits[key];
	    }
	    if(bucketSizes[targetBucketID] >= maxBucketSize) {
		var copyEmits = [];
		function copyEmit(elem) {
		    copyEmits.push(elem);
		}
		var newTargetBucketID = monitor.hash();
		var newTargetBucket = yield* getBucket(newTargetBucketID);
		internalID = copyObject(internalID, targetBucket, newTargetBucket, copyEmit);
		copyEmits.forEach(function(elem) {
		    newTargetBucket.add(elem);
		});
		yield* bucketStore.append(newTargetBucket, copyEmits);
		targetBucketID = newTargetBucketID;
	    }
	}
	return [targetBucketID, internalID].join('-');
    };
    this.retrieve = function*(ctx, id) {
	var split = id.split('-');
	var bucket = yield* getBucket(split[0]);
	return bucket.retrieve(split[1]);
    };
    this.checkCache = function*(ctx, v, p) {
	var split = v.split('-');
	var bucket = yield* getBucket(split[0]);
	return bucket.checkCache(v, p);
    };
};