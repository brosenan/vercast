var util = require('./util.js');

module.exports = function(hash) {
    function callAppFunc(state, funcName, args, cb) {
	var appHash = state._app;
	hash.unhash(appHash, util.protect(cb, function(err, app) {
	    var func = eval('(' +  app[funcName] + ')');
	    if(typeof func == 'function') {
		func.apply(state, args);
	    } else {
		throw new Error('Missing function: ' + funcName);
	    }
	}));
    }
    this.initialState = function(appHash, _) {
	var state = {_app: appHash};
	callAppFunc(state, 'init', [util.protect(_, function() {_(undefined, state);})], _);
    };
    this.apply = function(state, patch, _) {
	callAppFunc(state, 'do_' + patch.type, [patch, undefined, util.protect(_, function(err, result, sf) {
	    _(err, result, sf);
	})], _);
    };
    this.inv = function(appHash, patch, cb) {
	var methodName = 'inv_' + patch.type;
	util.seq([
	    function(_) { hash.unhash(appHash, _.to('app')); },
	    function(_) { 
		if(this.app[methodName]) {
		    var func = eval('(' + this.app[methodName] + ')');
		    cb(undefined, func(patch));
		} else {
		    cb(undefined, patch);
		}},
	], cb)();
    }
};