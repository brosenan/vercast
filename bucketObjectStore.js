var vercast = require('./vercast.js');
//var dbg = 0;
module.exports = function(disp, cache, bucketStore) {
    var self = this;

    this.hash = function(bucket, obj) {
	var json = JSON.stringify(obj);
	var objID = vercast.hash(json);
	var isRoot = false;
	if(!bucket) {
	    bucket = objID;
	    isRoot = true;
	}
	var id = vercast.genID(bucket, objID);
	cache.store(id.$, obj, json);
	if(isRoot) {
	    bucketStore.add(bucket, JSON.stringify(['seed', id, obj]));
	}
	return id;
    };

    this.unhash = function(id) {
	var obj = cache.fetch(id.$);
	if(obj) {
	    return obj;
	} else {
	    bucketStore.fetch(vercast.bucketID(id), handleBucketItem);
	}
    };

    this.init = function(ctx, clazz, args) {
	var obj = disp.init(createContext(ctx), clazz, args);
	var id = this.hash(ctx.bucket, obj);
	return id;
    };
    this.trans = function (origCtx, v1, p) {
	//if(dbg++>1000) throw Error('DBG');
	var ctx = {waitFor: [], bucket: vercast.bucketID(v1)};
	var pHash = this.hash(ctx.bucket, p);
	var key = v1.$ + ':' + pHash.$;
	var res = cache.fetch(key);
	if(res) {
	    origCtx.conf = origCtx.conf || res.conf;
	    return [res.v2, res.res];
	}
	var obj = this.unhash(v1);
	if(!obj) { // v1 is not in the cache
	    addWaitToCtx(origCtx, key);
	    cache.waitFor([v1.$], function() {
		ensureTrans(origCtx, v1, p);
	    });
	    return [undefined, undefined];
	}
	var pair = disp.apply(createContext(ctx), obj, p);
	origCtx.conf = origCtx.conf || ctx.conf;
	if(ctx.waitFor.length > 0) { // The underlying transition is not complete
	    origCtx.waitFor = ctx.waitFor.concat(origCtx.waitFor || []);
	    return [undefined, undefined];
	}
	if(pair[0]._replaceWith) {
	    pair[0] = pair[0]._replaceWith;
	} else {
	    pair[0] = this.hash(ctx.bucket, pair[0]);
	}
	var transRec = {v2: pair[0], res: pair[1], conf: ctx.conf};
	cache.store(key, transRec);
	if(v1.$ != transRec.v2.$ && ctx.bucket != origCtx.bucket) {
	    if(origCtx.bucket) {
		bucketStore.add(origCtx.bucket, JSON.stringify(['trans', key, transRec]));
	    }
	    bucketStore.add(ctx.bucket, JSON.stringify(['patch', v1, p]));
	}
	return pair;
    };
    function ensureTrans(origCtx, v1, p) {
	var ctx = {waitFor: [], bucket: origCtx.bucket};
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
    function createContext(ctx) {
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
	};
    }
    function handleBucketItem(err, item) {
	item = JSON.parse(item);
	var type = item[0];
	if(type == 'seed' || type == 'trans') {
	    cache.store(item[1].$, item[2]);
	} else if(type == 'patch') {
	    var v1 = item[1];
	    var p = item[2];
	    var obj = cache.fetch(v1.$);
	    if(obj) {
		self.trans({}, v1, p)
	    } else {
		cache.waitFor(v1, function() {
		    self.trans({}, v1, p)
		});
	    }
	}
    }
}
