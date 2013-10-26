var util = require('./util.js');

module.exports = function(app, hash) {
    
    this.initialState = function(appHash, cb) {
	util.seq([
	    function(_) { app.initialState(appHash, _.to('s0')); },
	    function(_) { hash.hash(this.s0, _.to('h0')); },
	    function(_) { cb(undefined, this.h0); },
	], cb)();
	
    }

    this.apply = function(h1, patch, cb) {
	util.seq([
	    function(_) { hash.unhash(h1, _.to('state')); },
	    function(_) { app.apply(this.state, patch, _.to('result', 'sf')); },
	    function(_) { hash.hash(this.state, _.to('h2')); },
	    function(_) { cb(undefined, this.h2, this.result, this.sf); },
	], cb)();
    };
    
    this.trans = this.apply;
};
