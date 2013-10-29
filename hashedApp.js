var util = require('./util.js');

module.exports = function(app, hash, kvs) {
    var self = this;
    this.initialState = function(appHash, cb) {
	util.seq([
	    function(_) { app.initialState(appHash, _.to('s0')); },
	    function(_) { hash.hash(this.s0, _.to('h0')); },
	    function(_) { cb(undefined, this.h0); },
	], cb)();
	
    }

    this.apply = function(h1, patch, cb) {
	var methodName = 'do_' + patch.type;
	if(this[methodName]) {
	    this[methodName](h1, patch, cb);
	} else {
	    util.seq([
		function(_) { hash.unhash(h1, _.to('state')); },
		function(_) { app.apply(this.state, patch, _.to('result', 'sf')); },
		function(_) { hash.hash(this.state, _.to('h2')); },
		function(_) { cb(undefined, this.h2, this.result, this.sf); },
	    ], cb)();
	}
    };
    
    this.trans = function(h1, patch, cb) {
	util.seq([
	    function(_) { 
		if(patch.type == '_hashed') {
		    this.hp = patch.hash; _();
		} else {
		    hash.hash(patch, _.to('hp')); 
		}
	    },
	    function(_) { kvs.check(h1.$hash$ + ':' + this.hp.$hash$, _.to('cached')); },
	    function(_) { if(this.cached) {cb(undefined, {$hash$: this.cached}, undefined, true);} else _(); },
	    function(_) { self.apply(h1, patch, _.to('h2', 'result', 'sf')); },
	    function(_) { if(!this.sf) {cb(undefined, this.h2, this.result, this.sf);} else _(); },
	    function(_) { kvs.store(h1.$hash$ + ':' + this.hp.$hash$, this.h2.$hash$, _); },
	    function(_) { cb(undefined, this.h2, this.result, this.sf); },
	], cb)();
    };

    this.do__inv = function(h1, patch, cb) {
	var methodName = 'inv_' + patch.patch.type;
	if(this[methodName]) {
	    return this[methodName](h1, patch.patch, cb);
	}
	util.seq([
	    function(_) { hash.unhash(h1, _.to('s1')); },
	    function(_) { app.inv(this.s1._app, patch.patch, _.to('unpatch')); },
	    function(_) { self.apply(h1, this.unpatch, cb); },
	], cb)();
    };

    this.do__comp = function(h1, patch, cb) {
	if(patch.patches.length == 0) {
	    return cb(undefined, h1, [], true);
	}
	util.seq([
	    function(_) { self.trans(h1, patch.patches[0], _.to('h2', 'r1', 'sf1')); },
	    function(_) { if(!this.sf1) { 
		this.r1 = {$badPatch: patch.patches[0], res: this.r1}; } _(); },
	    function(_) { if(patch.weak && !this.sf1) { 
		this.sf1 = true; 
		this.h2 = h1; } _(); },
	    function(_) { 
		patch.patches = patch.patches.slice(1);
		self.do__comp(this.h2, patch, _.to('h3', 'r2', 'sf2')); },
	    function(_) { cb(undefined, this.h3, [this.r1].concat(this.r2), this.sf1 && this.sf2); },
	], cb)();
    };
    this.do__hashed = function(h1, patch, cb) {
	util.seq([
	    function(_) { hash.unhash(patch.hash, _.to('patch')); },
	    function(_) { self.apply(h1, this.patch, cb); },
	], cb)();
    };

    this.inv__comp = function(h1, patch, cb) {
	var patches = patch.patches;
	var newPatches = [];
	for(var i = patches.length - 1; i >=0; i--) {
	    newPatches.push({type: '_inv', patch: patches[i]});
	}
	patch.patches = newPatches;
	this.apply(h1, patch, cb);
    };
    this.inv__inv = function(h1, patch, cb) {
	self.apply(h1, patch.patch, cb);
    };
    this.inv__hashed = function(h1, patch, cb) {
	util.seq([
	    function(_) { hash.unhash(patch.hash, _.to('patch')); },
	    function(_) { self.apply(h1, {type: '_inv', patch: this.patch}, cb); },
	], cb)();
    };
    this.query = function(h1, patch, cb) {
	var self = this;
	util.seq([
	    function(_) { self.apply(h1, patch, _.to('h2', 'result')); },
	    function(_) {
		if(this.h2.$hash$ != h1.$hash$) {
		    throw new Error('Attempted query changed state');
		}
		cb(undefined, this.result);
	    },
	], cb)();
    };

    this.branchQuery = function(branch, patch, cb) {
	util.seq([
	    function(_) { branch.tip(_.to('h1')); },
	    function(_) { self.query(this.h1, patch, cb); },
	], cb)();
    };
};
