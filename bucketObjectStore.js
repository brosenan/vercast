var vercast = require('./vercast.js');
//var dbg = 0;

var MAX_BUCKET_SIZE = 10;
var NEW_BUCKET_PROB = 1/MAX_BUCKET_SIZE;

module.exports = function(disp, cache, bucketStore) {
    var self = this;
    var tracer = new vercast.Tracer('bucketObjStore');

    this.hash = function(bucket, obj, ctx) {
	var json = JSON.stringify(obj);
	var objID = vercast.hash(json);
	var id = vercast.genID(bucket, objID);
	cache.store(id.$, obj, json);
	return id;
    };
    this.unhash = function(id) {
	var obj = cache.fetch(id.$);
	if(obj) {
	    return obj;
	} else {
	    tracer.trace({unhash_fetching: id});
	    bucketStore.fetch(vercast.bucketID(id), handleBucketItem);
	}
    };

    this.init = function(origCtx, clazz, args) {
	var ctx = {waitFor: [], 
		   bucket: origCtx.bucket,
		   replay: origCtx.replay};
	if(ctx.replay) ctx.bucket = ctx.replay;
	if(!ctx.bucket) {
	    args._type = clazz;
	    ctx.bucket = vercast.hash(JSON.stringify(args));
	    addDependency(bucketStore.add(ctx.bucket, JSON.stringify(['init', args])), origCtx);
	}
	var obj = disp.init(createContext(ctx), clazz, args);
	var id = this.hash(ctx.bucket, obj, ctx);
	return id;
    };
    this.trans = function (origCtx, v1, p) {
	var ctx = {waitFor: [], 
		   bucket: vercast.bucketID(v1),
		   replay: origCtx.replay};
	var pHash = this.hash(ctx.bucket, p, origCtx);
	p = cache.fetch(pHash.$); // take ownership of the object
	var key = v1.$ + ':' + pHash.$;
	if(!ctx.replay || ctx.replay != ctx.bucket) {
	    var res = cache.fetch(key);
	    if(res) {
		combineContexts(origCtx, res);
		return [res.v2, res.res];
	    }
	}
	var obj = this.unhash(v1);
	if(!obj) { // v1 is not in the cache
	    if(ctx.replay) throw new Error('Version not in cache when replaying');
	    addWaitToCtx(origCtx, key);
	    cache.waitFor([v1.$], function() {
		ensureTrans(origCtx, v1, p);
	    });
	    return [undefined, undefined];
	}
	var pair;
	try {
	    pair = disp.apply(createContext(ctx, v1), obj, p);
	} catch(e) {
	    origCtx.error = e;
	}
	combineContexts(origCtx, ctx);
	if(origCtx.error) { // An exception was thrown
	    return [undefined, undefined];
	}
	if(ctx.waitFor.length > 0) { // The underlying transition is not complete
	    if(ctx.replay) throw new Error('Underlying transition is not complete replaying bucket ' + ctx.replay);
	    origCtx.waitFor = ctx.waitFor.concat(origCtx.waitFor || []);
	    return [undefined, undefined];
	}
	if(pair[0]._replaceWith) {
	    pair[0] = pair[0]._replaceWith;
	} else {
	    pair[0] = this.hash(ctx.bucket, pair[0], origCtx);
	}
	var transRec = {v2: pair[0], res: pair[1], conf: ctx.conf, eff: ctx.eff};
	if(!ctx.replay) {
	    if(v1.$ != transRec.v2.$ && ctx.bucket != origCtx.bucket) {
		if(vercast.randomByKey(key, NEW_BUCKET_PROB)) {
		    transRec.v2 = moveToNewBucket(transRec.v2, origCtx);
		}
		if(origCtx.bucket) {
		    addDependency(bucketStore.add(origCtx.bucket, JSON.stringify(['trans', key, transRec])), origCtx);
		}
		addDependency(bucketStore.add(ctx.bucket, JSON.stringify(['patch', v1, p])), origCtx);
	    }
	}
	if(!ctx.replay || vercast.bucketID(transRec.v2) == ctx.replay) {
	    cache.store(key, transRec);
	}
	return [transRec.v2, transRec.res];
    };
    function ensureTrans(origCtx, v1, p) {
	var ctx = {waitFor: [], bucket: origCtx.bucket, replay: origCtx.replay};
	self.trans(ctx, v1, p); // first pass
	if(ctx.waitFor) {
	    cache.waitFor(ctx.waitFor, function() {
		ensureTrans(origCtx, v1, p);
	    });
	}
    }
    function addWaitToCtx(ctx, key) {
	if(ctx.waitFor) {
	    ctx.waitFor.push(key);
	} else {
	    ctx.waitFor = [key];
	}
    }
    function initCtx(ctx) {
	if(!ctx.waitFor) {
	    ctx.waitFor = [];
	}
    }
    function createContext(ctx, v0) {
	return {
	    init: function(className, args) {
		return self.init(ctx, className, args);
	    },
	    trans: function(v1, p) {
		var v2 = self.trans(ctx, v1, p)[0];
		return v2;
	    },
	    query: function(v, q) {
		return self.trans(ctx, v, q)[1];
	    },
	    transQuery: function(v1, p) {
		return self.trans(ctx, v1, p);
	    },
	    conflict: function() {
		ctx.conf = true;
	    },
	    effect: function(eff) {
		if(ctx.eff) {
		    ctx.eff.push(eff);
		} else {
		    ctx.eff = [eff];
		}
	    },
	    _dbg: ctx,
	    self: function() {
		return v0;
	    },
	};
    }
    function handleBucketItem(err, item, bucket) {
	item = JSON.parse(item);
	tracer.trace({hanling_item: item});
	var type = item[0];
	if(type == 'seed' || type == 'trans') {
	    cache.store(item[1], item[2]);
	} else if(type == 'patch') {
	    var v1 = item[1];
	    var p = item[2];
	    var ctx = {replay: bucket};
	    if(cache.check(v1.$)) {
		self.trans(ctx, v1, p)
	    } else {
		cache.waitFor(v1, function() {
		    self.trans(ctx, v1, p);
		});
	    }
	} else if(type == 'init') {
	    var className = item[1]._type;
	    var args = item[1];
	    var ctx = {replay: bucket};
	    self.init(ctx, className, args);
	}
    }
    function moveToNewBucket(id, ctx) {
	tracer.trace({moving: id});
	var bucket = vercast.bucketID(id);
	var q = [id];
	var traverse = [];
	while(q.length > 0 && traverse.length < MAX_BUCKET_SIZE) {
	    var v = q.shift();
	    //if(vercast.bucketID(v) != bucket) continue;
	    var obj = cache.fetch(v.$);
	    var children = vercast.childObjects(obj);
	    q = q.concat(children);
	    traverse.unshift([v.$, obj]);
	}
	var newBucket = vercast.objID(id);
	var map = {};
	for(var i = 0; i < traverse.length; i++) {
	    var currID = traverse[i][0];
	    var curr = traverse[i][1];
	    var children = vercast.childObjects(curr);
	    for(var j = 0; j < children.length; j++) {
		var child = children[j];
		var newID = map[child.$];
		if(!newID && vercast.bucketID(child) == bucket) {
		    tracer.trace({move: {child: child.$, bucket: bucket}});
		    newID = moveToNewBucket(child, ctx);
		} else if(!newID) {
		    newID = child;
		}
		child.$ = newID.$; // This should change the object itself
	    }
	    map[currID] = self.hash(newBucket, curr, ctx);
	    tracer.trace({newBucketObj: map[currID], bucket: newBucket});
	    addDependency(bucketStore.add(newBucket, JSON.stringify(['seed', map[currID].$, curr])), ctx);
	}
	tracer.trace({moved: id, to: map[id.$]});
	return map[id.$];
    }
    function addDependency(id, ctx) {
	if(ctx.depend) {
	    ctx.depend.push(id);
	} else {
	    ctx.depend = [id];
	}
    }
    function combineContexts(origCtx, ctx) {
	origCtx.conf = origCtx.conf || ctx.conf;
	origCtx.error = origCtx.error || ctx.error;
	if(ctx.eff) origCtx.eff = ctx.eff.concat(origCtx.eff || []);
	if(origCtx.depend) {
	    origCtx.depend = origCtx.depend.concat(ctx.depend || []);
	}
    }
}
