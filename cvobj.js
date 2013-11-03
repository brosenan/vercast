var util = require('./util.js');

module.exports = function(hashDB) {
    this.createObject = function(cls, state, cb) {
	state._class = {};
	for(var key in cls) {
	    if(typeof key == 'function') {
		state._class[key] = cls[key].toString();
	    } else {
		state._class[key] = cls[key];
	    }
	}
	util.seq([
	    function(_) { hashDB.hash(state, _.to('h0')); },
	    function(_) { cb(undefined, this.h0); },
	], cb)();
    };
};