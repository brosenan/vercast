var util = require('./util.js');

module.exports = function(hashDB, kvs) {
    var self = this;
    this.createObject = function(cls, state, cb) {
	var strCls = {};
	for(var key in cls) {
	    if(typeof cls[key] == 'function') {
		strCls[key] = cls[key].toString();
	    } else {
		strCls[key] = cls[key];
	    }
	}
	util.seq([
	    function(_) { hashDB.hash(strCls, _.to('hCls')); },
	    function(_) { state._class = this.hCls;
			  hashDB.hash(state, _.to('h0')); },
	    function(_) { cb(undefined, this.h0); },
	], cb)();
    };

    this.apply = function(h1, patch, cb) {
	util.seq([
	    function(_) { hashDB.unhash(h1, _.to('state')); },
	    function(_) { retrieveMethod(this.state._class, patch, _.to('func')); },
	    function(_) { callFunc(this.func, this.state, patch, _.to('res', 'effect', 'conflict')); },
	    function(_) { hashDB.hash(this.state, _.to('h2')); },
	    function(_) { cb(undefined, this.h2, this.res, this.effect, this.conflict); },
	], cb)();
    };

    var methodCache = {};
    function retrieveMethod(cls, patch, cb) {
	if(patch.type) {
	    var cached = methodCache[cls.$hash$ + ':' + patch.type];
	    if(cached) {
		return cb(undefined, cached);
	    }
	}
	util.seq([
	    function(_) { methodCode(cls, patch, _.to('funcStr')); },
	    function(_) { if(!this.funcStr) {
			      cb(new Error('Unsupported patch type: ' + patch.type));
			  }
			  var func = eval('(' + this.funcStr + ')');
			  methodCache[cls.$hash$ + ':' + patch.type] = func;
			  cb(undefined, func);},
	], cb)();
    }

    function methodCode(cls, patch, cb) {
	if(patch.type) {
	    util.seq([
		function(_) { hashDB.unhash(cls, _.to('clsBody')); },
		function(_) { cb(undefined, this.clsBody[patch.type]); },
	    ], cb)();
	} else {
	    util.seq([
		function(_) { hashDB.unhash(patch.code, _.to('code')); },
		function(_) { cb(undefined, this.code); },
	    ], cb)();
	}
    }
    function callFunc(func, state, patch, cb) {
	var ctx = {
	    ret: function(ret) {
		cb.call(this, undefined, ret, undefined, this.conflictFlag);
	    },
	    done: function(err) {
		cb(err);
	    },
	    /*apply: function(h1, p, cb) {
		self.apply(h1, p, util.protect(cb, function(err, h2, ret, effect, conflict) {
		    ctx.conflictFlag = conflict || ctx.conflictFlag;
		    cb(err, h2, ret);
		}));
	    },*/
	    conflictFlag: false,
	    conflict: function() {
		this.conflictFlag = true;
	    },
	    hash: function(obj, cb) {
		hashDB.hash(obj, cb);
	    },
	    unhash: function(hash, cb) {
		hashDB.unhash(hash, cb);
	    },
	    query: function(h1, patch, cb) {
		self.query(h1, patch, cb);
	    },
	    trans: function(h1, patch, cb) {
		self.trans(h1, patch, util.protect(cb, function(err, h2, ret, effect, conflict) {
		    ctx.conflictFlag = conflict || ctx.conflictFlag;
		    cb(err, h2);
		}));
	    },
	};
	func.call(state, patch, ctx);
    }

    this.invert = function(patch, cb) {
	if(!patch.inv) {
	    return cb(undefined, patch);
	}
	util.seq([
	    function(_) { hashDB.unhash(patch.inv, _.to('code')); },
	    function(_) { var func = eval('(' + this.code + ')');
			  func(patch, cb); },
	], cb)();
    };

    this.createChainPatch = function(patches, cb) {
	var code = function(patch, ctx) {
	    var state = this;
	    util.seq([
		function(_) { ctx.hash(state, _.to('h1')); },
		function(_) { applyPatches(patch.patches, this.h1, _.to('h3')); },
		function(_) { ctx.unhash(this.h3, _.to('state')); },
		function(_) { 
		    for(var key in this.state) {
			state[key] = this.state[key];
		    }
		    ctx.ret();
		},
	    ], cb)();

	    function applyPatches(patches, h1, cb) {
		if(patches.length == 0) {
		    return cb(undefined, h1);
		}
		util.seq([
		    function(_) { ctx.trans(h1, patches[0], _.to('h2')); },
		    function(_) { applyPatches(patches.slice(1), this.h2, _.to('h3')); },
		    function(_) { cb(undefined, this.h3); },
		], cb)();
	    }
	};
	var inv = function(patch, cb) {
	    var patches = patch.patches;
	    patch.patches = [];
	    invertPatches(patches, patch, patches.length - 1, cb);

	    function invertPatches(patches, invPatch, index, cb) {
		if(index < 0) {
		    return cb(undefined, invPatch);
		}
		util.seq([
		    function(_) { self.invert(patches[index], _.to('inv')); },
		    function(_) { invPatch.patches.push(this.inv);
				  invertPatches(patches, invPatch, index - 1, cb);},
		], cb)();
	    }
	};
	util.seq([
	    function(_) { hashDB.hash(code.toString(), _.to('code')); },
	    function(_) { hashDB.hash(inv.toString(), _.to('inv')); },
	    function(_) { cb(undefined, {code: this.code, inv: this.inv, patches: patches}); },
	], cb)();
    };

    this.trans = function(h1, patch, cb) {
	util.seq([
	    function(_) { hashDB.hash(patch, _.to('p')); },
	    function(_) { this.key = h1.$hash$ + ':' + this.p.$hash$;
			  kvs.check(this.key, _.to('cached')); },
	    function(_) { if(this.cached) { cb(undefined, this.cached[0]); } else { _(); } },
	    function(_) { self.apply(h1, patch, _.to('h2', 'res', 'effect', 'conflict')); },
	    function(_) { kvs.store(this.key, [this.h2], _); },
	    function(_) { cb(undefined, this.h2, this.res, this.effect, this.conflict); },
	], cb)();
    };

    this.query = function(h1, patch, cb) {
	util.seq([
	    function(_) { self.apply(h1, patch, _.to('h2', 'res')); },
	    function(_) { 
		if(this.h2.$hash$ != h1.$hash$) { 
		    cb(new Error('Query patches should not change object state'));
		} else {
		    cb(undefined, this.res); 
		}},
	], cb)();
    };
};