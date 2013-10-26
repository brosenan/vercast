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
	    function(_) { hash.hash(patch, _.to('hp')); },
	    function(_) { kvs.check(h1.$hash$ + ':' + this.hp.$hash$, _.to('cached')); },
	    function(_) { if(this.cached) {cb(undefined, {$hash$: this.cached});} else _(); },
	    function(_) { self.apply(h1, patch, _.to('h2', 'result', 'sf')); },
	    function(_) { if(!this.sf) {cb(undefined, this.h2, this.sf);} else _(); },
	    function(_) { kvs.store(h1.$hash$ + ':' + this.hp.$hash$, this.h2.$hash$, _); },
	    function(_) { cb(undefined, this.h2, this.sf); },
	], cb)();
    };

    this.do__inv = function(h1, patch, cb) {
	util.seq([
	    function(_) { hash.unhash(h1, _.to('s1')); },
	    function(_) { app.inv(this.s1._app, patch.patch, _.to('unpatch')); },
	    function(_) { self.apply(h1, this.unpatch, cb); },
	], cb)();
    };

    this.do__comp = function(h1, patch, cb) {
	if(patch.patches.length == 0) {
	    return cb(undefined, h1, undefined, true);
	}
	util.seq([
	    function(_) { self.trans(h1, patch.patches[0], _.to('h2', 'sf1')); },
	    function(_) { self.do__comp(this.h2, {type: '_comp', patches: patch.patches.slice(1)}, _.to('h3', 'res', 'sf2')); },
	    function(_) { cb(undefined, this.h3, undefined, this.sf1 && this.sf2); },
	], cb)();
    };
};
