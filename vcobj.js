var util = require('./util.js');

module.exports = function(hashDB) {
    this.createObject = function(cls, state, cb) {
	var strCls = {};
	for(var key in cls) {
	    if(typeof cls[key] == 'function') {
		strCls[key] = cls[key].toString();
	    } else {
		strCls[key] = cls[key];
	    }
	}
	util.seq([
	    function(_) { hashDB.hash(strCls, _.to('hCls')); },
	    function(_) { state._class = this.hCls;
			  hashDB.hash(state, _.to('h0')); },
	    function(_) { cb(undefined, this.h0); },
	], cb)();
    };

    this.apply = function(h1, patch, cb) {
	util.seq([
	    function(_) { hashDB.unhash(h1, _.to('state')); },
	    function(_) { retrieveMethod(this.state._class, patch, _.to('func')); },
	    function(_) { this.func.call(this.state, patch, cb); },
	], cb)();
    };

    function retrieveMethod(cls, patch, cb) {
	util.seq([
	    function(_) { hashDB.unhash(cls, _.to('clsBody')); },
	    function(_) { var funcStr = this.clsBody[patch.type];
			  if(!funcStr) {
			      cb(new Error('Unsupported patch type: ' + patch.type));
			  }
			  var func = eval('(' + funcStr + ')');
			  cb(undefined, func);},
	], cb)();
    }
};