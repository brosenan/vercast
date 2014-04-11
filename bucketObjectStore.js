var vercast = require('./vercast.js');

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
    this.trans = function (ctx, v1, p) {
	var obj = this.unhash(v1);
	if(obj) {
	    var pair = disp.apply(createContext(ctx), obj, p);
	    if(pair[0]._replaceWith) {
		pair[0] = pair[0]._replaceWith;
	    } else {
		pair[0] = this.hash(ctx.bucket, pair[0]);
	    }
	    return pair;
	} else {
	    addWaitToCtx(ctx, v1.$);
	    return [undefined, undefined];
	}
    };
    function addWaitToCtx(ctx, key) {
	if(ctx.waitFor) {
	    ctx.waitFor.push(key);
	} else {
	    ctx.waitFor = [key];
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

