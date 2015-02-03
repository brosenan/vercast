"use strict";
var assert = require('assert');

var vercast = require('vercast');
var LRU = require('lru-cache');


module.exports = function(bucketStore, createBucket, options) {
    var emits = Object.create(null);
    options = options || {};
    var maxBucketSize = options.maxBucketSize || 100;
    var maxOpenBuckets = options.maxOpenBuckets || 1000;
    var maxSeedSize = options.maxSeedSize || maxBucketSize;

    var buckets = LRU(maxOpenBuckets);

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
	var bucketID = ctx.bucket || '';
	var bucket = yield* getBucket(bucketID);
	var ownEmits = [];
	var emit = function(elem) {
	    ownEmits.push(elem);
	}
	var internalID = bucket.store(obj, emit);
	var prevEmits = emits[emitionKey(ctx)] || [];
	if(!bucket.sizeGuard.canAppend(prevEmits.concat(ownEmits)) || bucketID === '') {
	    var monitor = new vercast.ObjectMonitor(obj);
	    bucketID = monitor.hash();
	    bucket = yield* getBucket(bucketID);
	    yield* bucket.sizeGuard.append(ownEmits, bucketID);
	} else {
	    emits[emitionKey(ctx)] = prevEmits.concat(ownEmits);
	}
	return [bucketID, internalID].join('-');
    };
    function* fillBucket(id, bucket) {
	var res = yield* bucketStore.retrieve(id, bucket._lastTuid, true);
	res.elems.forEach(function(elem) {
	    bucket.add(elem);
	});
	bucket._lastTuid = res.tuid;
    }
    function* getBucket(id) {
	var bucket = buckets.get(id);
	if(!bucket) {
	    bucket = createBucket(id);
	    if(id !== '') {
		buckets.set(id, bucket);
	    }
	    yield* fillBucket(id, bucket);
	    bucket.name = id;
	    bucket.sizeGuard = new SizedBucketStore(id);
	}
	return bucket;
    }

    function emitionKey(ctx) {
	return [ctx.bucket, ctx.originator].join('-');
    }
    function emitFunc(ctx, bucket) {
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
    
    function* copyObject(internalID, bucketFrom, bucketTo, emit) {
	var queue = [];
	var stack = [];
	queue.push(internalID);
	// BFS the tree and place up to maxSeedSize elements in the stack
	while(queue.length > 0 && stack.length < maxSeedSize) {
	    var curr = queue.shift();
	    stack.push(curr);
	    let monitor = bucketFrom.retrieve(curr);
	    let children = getChildren(monitor.object());
	    children.filter(function(child) {
		return child.split('-')[0] === bucketFrom.name;
	    }).forEach(function(child) {
		queue.push(child.split('-')[1]);
	    });
	}
	// Now the stack contains all elements we wish to move to the target bucket
	// and the queue contains all elements we need to create new buckets for.
	var map = Object.create(null);
	for(let i = 0; i < queue.length; i++) {
	    let monitor = bucketFrom.retrieve(queue[i]);
	    let idFrom = [bucketFrom.name, queue[i]].join('-');
	    let newBucketID = monitor.hash();
	    let newBucket = yield* getBucket(newBucketID);
	    let emits = [];
	    let newID = yield* copyObject(queue[i], bucketFrom, newBucket, function(elem) { emits.push(elem); });
	    map[idFrom] = [newBucketID, newID].join('-');
	    yield* newBucket.sizeGuard.append(emits, newBucketID);
	}
	while(stack.length > 0) {
	    let internal = stack.pop();
	    let obj =  bucketFrom.retrieve(internal).object();
	    let idFrom = bucketFrom.name + '-' + internal;
	    obj = translateChildren(obj, map);
	    map[idFrom] = bucketTo.name + '-' + bucketTo.store(obj, emit);
	}
	return map[bucketFrom.name + '-' + internalID].split('-')[1];
    }
    function getChildren(obj) {
	var children = [];
	pushChildren(obj, children);
	return children;
    }

    function pushChildren(obj, children) {
	if(!obj) return;
	if('$' in obj) {
	    children.push(obj.$);
	    return;
	}
	Object.keys(obj).forEach(function(key) {
	    var field = obj[key];
	    if(typeof field === 'object') {
		pushChildren(field, children);
	    }
	});
    }

    function translateChildren(obj, map) {
	if(!obj) return obj;
	if(typeof obj === 'object') {
	    if('$' in obj) {
		if(obj.$ in map) {
		    return {$: map[obj.$]};
		} else {
		    return obj;
		}
	    } else {
		let newObj = Object.create(null);
		Object.keys(obj).forEach(function(key) {
		    newObj[key] = translateChildren(obj[key], map);
		});
		return newObj;
	    }
	} else {
	    return obj;
	}
    }

    this.storeVersion = function*(ctx, v1, p, monitor, r, eff) {
	var ctxBucketID = ctx.bucket || '';
	var ctxBucket = yield* getBucket(ctxBucketID);
	var internalID;
	var oldInternalID = v1.split('-')[1];
	var targetBucketID = bucketID(v1);
	var targetBucket = yield* getBucket(targetBucketID);
	if(targetBucketID === ctxBucketID) {
	    internalID = ctxBucket.storeInternal(v1, p, monitor, r, eff, emitFunc(ctx, targetBucket));
	} else {
	    var childCtx = this.deriveContext(ctx, v1, p);
	    internalID = targetBucket.storeIncoming(v1, p, monitor, r, eff, emitFunc(childCtx, targetBucket));
	    var key = emitionKey(childCtx);
	    if(internalID !== oldInternalID) {
		let myEmits = emits[key] || [];
		if(targetBucket.sizeGuard.canAppend(myEmits)) {
		    yield* targetBucket.sizeGuard.append(myEmits, targetBucketID);
		} else {
		    var copyEmits = [];
		    function copyEmit(elem) {
			copyEmits.push(elem);
		    }
		    var newTargetBucketID = monitor.hash();
		    var newTargetBucket = yield* getBucket(newTargetBucketID);
		    internalID = yield* copyObject(internalID, targetBucket, newTargetBucket, copyEmit);
		    //yield* bucketStore.append(newTargetBucket, copyEmits);
		    targetBucketID = newTargetBucketID;
		}
	    }
	    delete emits[key];
	}
	if(targetBucketID !== ctxBucketID) {
	    ctxBucket.storeOutgoing(v1, p, [targetBucketID, internalID].join('-'), r, eff, emitFunc(ctx, ctxBucket));
	}
	return [targetBucketID, internalID].join('-');
    };
    this.retrieve = function*(ctx, id) {
	var split = id.split('-');
	var bucket = yield* getBucket(split[0]);
	try {
	    return bucket.retrieve(split[1]);
	} catch(e) {
	    yield* fillBucket(split[0], bucket);
	    return bucket.retrieve(split[1]);
	}
    };
    this.checkCache = function*(ctx, v, p) {
	var bucketID = ctx.bucket || '';
	var bucket = yield* getBucket(bucketID);
	return bucket.checkCache(v, p);
    };
    function SizedBucketStore(bucketID) {
	var size = 0;
	this.append = function*(items, id) {
	    size += items.length;
	    assert.equal(id, bucketID);
	    yield* bucketStore.append(bucketID, items);
	}
	this.canAppend = function(items) {
//	    console.log(size + ' + ' + items.length + ' <= ' + maxBucketSize, 
//			bucketID,
//			size + items.length <= maxBucketSize);
	    return size + items.length <= maxBucketSize;
	}
    }
    this.recordTrans = function*() {};
};