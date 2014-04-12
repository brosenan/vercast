var vercast = require('./vercast.js');

var __ID__ = 0;
function unique() { return __ID__++; }

module.exports = function(disp, cache, bucketStore) {
    var self = this;

    this.hash = function(bucket, obj) {
	var json = JSON.stringify(obj);
	var objID = vercast.hash(json);
	var id = bucket + '-' + objID;
	cache.store(id, obj, json);
	bucketStore.add(id, JSON.parse(json))
	return {$:id};
    };

    this.unhash = function(id) {
	var obj = cache.fetch(id.$);
	if(obj) {
	    return obj;
	} else {
	    bucketStore.fetch(id.$, function(err, bucket) {
		cache.store(id.$, bucket[0]);
	    });
	}
    };

    this.init = function(ctx, clazz, args) {
	var obj = disp.init(createContext(ctx), clazz, args);
	return this.hash(ctx.bucket, obj);
    };
    this.trans = function (origCtx, v1, p) {
	var ctx = {waitFor: [], bucket: origCtx.bucket, dbg: unique()};
	var pHash = this.hash(ctx.bucket, p);
	var key = v1.$ + ':' + pHash.$;
	var res = cache.fetch(key);
	if(res) {
	    return [res.v2, res.res];
	}
	var obj = this.unhash(v1);
	if(!obj) {
	    addWaitToCtx(origCtx, key);
	    cache.waitFor([v1.$], function() {
		self.trans({}, v1, p);
	    });
	    return [undefined, undefined];
	}
	var pair = disp.apply(createContext(ctx), obj, p);
	if(ctx.waitFor.length > 0) {
	    //addWaitToCtx(origCtx, key);
	    cache.waitFor(ctx.waitFor, function() {
		self.trans({}, v1, p);
	    });
	    return [undefined, undefined];
	}
	if(pair[0]._replaceWith) {
	    pair[0] = pair[0]._replaceWith;
	} else {
	    pair[0] = this.hash(ctx.bucket, pair[0]);
	}
	cache.store(key, {v2: pair[0], res: pair[1]});
	return pair;
    };
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
		return self.trans(ctx, v1, p)[0];
	    },
	    query: function(v, q) {
		return self.trans(ctx, v, q)[1];
	    },
	};
    }
}

