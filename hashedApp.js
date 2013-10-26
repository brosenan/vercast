var util = require('./util.js');

module.exports = function(app, hash) {
    
    this.initialState = function(appHash, cb) {
	util.seq([
	    function(_) { app.initialState(appHash, _.to('s0')); },
	    function(_) { hash.hash(this.s0, _.to('h0')); },
	    function(_) { cb(undefined, this.h0); },
	], cb)();
	
    }
};
