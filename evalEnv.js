var util = require('./util.js');

module.exports = function(hashDB, opCache, evaluators) {
    var self = this;
    this.init = function(evaluator, args, cb) {
	if(!evaluators[evaluator]) {
	    throw new Error('Evaluator ' + evaluator + ' is not defined');
	}
	var initMethod = evaluators[evaluator].init;
	if(!initMethod) {
	    throw new Error('Evaluator ' + evaluator + ' does not define in init method');
	}
	util.seq([
	    function(_) { initMethod.call(evaluators[evaluator], args, createContext(_.to('s0'))); },
	    function(_) { this.s0._type = evaluator;
			  hashDB.hash(this.s0, cb); },
	], cb)();
    }

    function createContext(cb) {
	return {
	    ret: function(state, res) {
		cb(undefined, state, res, undefined, this.conflicting);
	    },
	    err : function(err) {
		cb(err);
	    },
	    trans : function(s1, patch, cb) {
		var ctx = this;
		self.trans(s1, patch, function(err, state, res, eff, conf) {
		    ctx.conflicting = ctx.conflicting || conf;
		    cb(err, state, res, eff, ctx.conflicting);
		});
	    },
	    apply: function(s1, patch, unapply, cb) {
		var ctx = this;
		self.apply(s1, patch, unapply, function(err, state, res, eff, conf) {
		    ctx.conflicting = ctx.conflicting || conf;
		    cb(err, state, res, eff, ctx.conflicting);
		});
	    },
	    conflict: function() {
		this.conflicting = true;
	    },
	    conflicting: false,
	    init: function(evaluator, args, cb) {
		self.init(evaluator, args, cb);
	    },
	    hash: function(obj, cb) {
		hashDB.hash(obj, cb);
	    },
	};
    }

    this.apply = function(h1, patch, unapply, cb) {
	util.seq([
	    function(_) { hashDB.unhash(h1, _.to('s1')); },
	    function(_) { var method = getMethod(patch, 'apply') || getMethod(this.s1, 'apply');
			  if(!method) { throw new Error('Cannot apply patch ' + patch._type + ' on object of type ' + this.s1._type); }
			  method(this.s1, patch, unapply, createContext(cb)); },
	], cb)();
    };

    function getMethod(state, methodName) {
	var ev = evaluators[state._type];
	if(!ev) return undefined;
	var method = ev[methodName];
	if(!method) {
	    throw new Error('Evaluator ' + state._type + ' does not provide a method named ' + methodName);
	}
	return function() { return method.apply(ev, arguments); };
    }

    this.trans = function(s1, patch, cb) {
	util.seq([
	    function(_) { hashDB.hash(s1, _.to('h1')); },
	    function(_) { hashDB.hash(patch, _.to('hp')); },
	    function(_) { this.key = this.h1.$hash$ + ':' + this.hp.$hash$;
			  opCache.check(this.key, _.to('cached')); },
	    function(_) { if(this.cached) { cb(undefined, this.cached.s, undefined, this.cached.eff, false); }
			  else { _(); } },
	    function(_) { self.apply(s1, patch, false, _.to('s2', 'res', 'eff', 'conf')); },
	    function(_) { hashDB.hash(this.s2, _.to('h2')); },
	    function(_) { 
		if(!this.conf && typeof(this.res) == 'undefined') { 
		    opCache.store(this.key, {s: this.h2, eff: this.eff}, _); 
		    } else { _(); } },
	    function(_) { cb(undefined, this.h2, this.res, this.eff, this.conf); },
	], cb)();
    };

    this.query = function(s, q, cb) {
	util.seq([
	    function(_) { hashDB.hash(s, _.to('before')); },
	    function(_) { self.apply(s, q, false, _.to('s', 'res')); },
	    function(_) { hashDB.hash(this.s, _.to('after')); },
	    function(_) { if(this.before.$hash$ != this.after.$hash$) { 
		throw new Error('Query patch ' + q._type + ' changed object state');
	    } else _(); },
	    function(_) { cb(undefined, this.res); },
	], cb)();
    }
}
