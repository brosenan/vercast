"use strict";
var events = require('events');

var vercast = require('vercast');


module.exports = function(disp, effSeqFactory, storage) {
    var transListeners = [];
    effSeqFactory = effSeqFactory || new vercast.SequenceStoreFactory(new vercast.DummyKeyValueStore());
    this.init = function*(type, args, ctx) {
	ctx = ctx || Object.create(null);
	var obj = yield* disp.init(createContext(this), type, args);
	return {$: yield* storage.storeNewObject(ctx, obj)};
    };
    this.trans = function*(v, p, u, ctx) {
	ctx = ctx || {};
	if(typeof v.$ === 'undefined') {
	    throw Error('undefined version ID');
	}
	var cached = yield* storage.checkCache(ctx, v.$, p);
	if(cached) {
	    return cached;
	}

	var effSeq = effSeqFactory.createSequenceStore();
	var monitor = yield* storage.retrieve(ctx, v.$);
	var newCtx = createContext(this, effSeq, v, storage.deriveContext(ctx, v.$, p));
	var r = yield* disp.apply(newCtx, monitor.proxy(), p, u);
	var v2 = v;
	var eff = yield* effSeq.hash();
	if(!monitor.object()) {
	    throw Error("A patch cannot transform an object to null or undefined");
	} else if(monitor.object()._type) {
	    v2 = {$: yield* storage.storeVersion(ctx, v.$, p, monitor, r, eff)};
	} else if(monitor.object().$) {
	    v2 = monitor.object();
	} else {
	    throw Error('new version is niether a avalid object nor an ID');
	}
	for(var iListener = 0; iListener < transListeners.length; iListener += 1) {
	    yield* transListeners[iListener](v, p, u, v2, r, eff);
	}
	return {r: r, 
		v: v2,
		eff: eff};
    };
    this.getSequenceStore = function() {
	return effSeqFactory.createSequenceStore();
    };
    this.addTransListener = function(handler) {
	transListeners.push(handler);
    };
};
function createContext(self, effSeq, v, ctx) {
    return {
	init: function*(type, args) {
	    return yield* self.init(type, args);
	},
	trans: function*(v, p, u) {
	    var res = yield* self.trans(v, p, u, ctx);
	    if(typeof effSeq !== 'undefined') {
		yield* effSeq.append(res.eff);
	    } else if(res.eff !== '') {
		throw Error('Effects are not allowed here');
	    }
	    return res;
	},
	conflict: function(reason) {
	    var err = Error(reason);
	    err.isConflict = true;
	    throw err;
	},
	effect: function*(p) {
	    yield* effSeq.append(p);
	},
	self: function() {
	    return v;
	},
	getSequenceStore: function() {
	    return self.getSequenceStore();
	},
	clone: function(obj) {
	    if(typeof obj === 'object' && obj && 
	       typeof obj.clone === 'function') {
		return obj.clone();
	    } else {
		return obj;
	    }
	},
    };
}
