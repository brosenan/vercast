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
		cb(undefined, state, res, this.effects, this.conflicting);
	    },
	    err : function(err) {
		cb(err);
	    },
	    trans : function(s1, patch, cb) {
		var ctx = this;
		self.trans(s1, patch, function(err, state, res, eff, conf) {
		    ctx.conflicting = ctx.conflicting || conf;
		    ctx.effects = ctx.effects.concat(eff);
		    cb(err, state, res, eff, ctx.conflicting);
		});
	    },
	    apply: function(s1, patch, unapply, cb) {
		var ctx = this;
		self.apply(s1, patch, unapply, function(err, state, res, eff, conf) {
		    ctx.conflicting = ctx.conflicting || conf;
		    ctx.effects = ctx.effects.concat(eff);
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
	    unhash: function(hash, cb) {
		hashDB.unhash(hash, cb);
	    },
	    effects: [],
	    effect: function(eff) {
		this.effects.push(eff);
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
	util.depend([
	    function(_) { hashDB.unhash(patch, _('patch')); },
	    function(_) { hashDB.hash(s1, _('h1')); },
	    function(patch, _) { hashDB.hash(patch, _('hp')); },
	    function(h1, hp, _) { this.key = h1.$hash$ + ':' + hp.$hash$;
			  opCache.check(this.key, _('cached')); },
	    function(cached, _) { if(cached) {
		var cachedObj = JSON.parse(cached);
		cb(undefined, cachedObj.s, undefined, cachedObj.eff, false);
	    } else { 
		_('notCached')(); 
	    }},
	    function(notCached, patch, _) { self.apply(s1, patch, false, _('s2', 'res', 'eff', 'conf')); },
	    function(s2, _) { hashDB.hash(s2, _('h2')); },
	    function(conf, res, h2, eff, _) { 
		if(!conf && typeof(res) == 'undefined') { 
		    opCache.store(this.key, JSON.stringify({s: h2, eff: eff}), _('stored')); 
		} else {
		    _('stored')();
		} },
	    function(stored, h2, res, eff, conf, _) { cb(undefined, h2, res, eff, conf);  },
	], cb);
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
    this.hash = function(value, cb) {
	hashDB.hash(value, cb);
    };
}
