var util = require('./util.js');

module.exports = function(hash) {
    this.initialState = function(appHash, _) {
	hash.unhash(appHash, util.protect(_, function(err, app) {
	    var init = eval('(' +  app.init + ')');
	    if(typeof init == 'function') {
		var state = {_app: appHash};
		init.call(state);
		_(undefined,state);
	    }
	}));
    };
};