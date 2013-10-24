var util = require('./util.js');

module.exports = function(hash) {
    function callAppFunc(state, funcName, args) {
	var appHash = state._app;
	hash.unhash(appHash, function(err, app) {
	    var func = eval('(' +  app[funcName] + ')');
	    if(typeof func == 'function') {
		func.apply(state, args);
	    }
	});
    }
    this.initialState = function(appHash, _) {
	var state = {_app: appHash};
	callAppFunc(state, 'init', []);
	_(undefined, state);
    };
    this.query = function(state, query, _) {
	callAppFunc(state, 'do_' + query.type, [query, undefined, util.protect(_, function(err, result, sf) {
	    _(err, result, sf);
	})]);
    };
};