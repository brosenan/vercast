var CheckerObjectStore = require('./checkerObjectStore.js');

module.exports = function(disp, list) {
    var ostore = new CheckerObjectStore(new DummyObjectStore(disp));
    var ret = function(done) {
	var ctx = {};
	var v = ostore.init(ctx, list[0]._type, list[0]);
	var pair = [v];
	for(var i = 1; i < list.length; i++) {
	    if(typeof list[i] === 'object' && '_type' in list[i]) {
		if(ctx.error) return done(ctx.error);
		if(ctx.conf) return done(Error("A conflict was reported"));
		pair = ostore.trans(ctx, pair[0], list[i]);
	    } else if(typeof list[i] === 'object' && 'error' in list[i]) {
		assert(ctx.error, 'An error should be raised');
		assert.equal(ctx.error.message, list[i].error);
		delete ctx.error;
	    } else if(typeof list[i] === 'object' && 'conflict' in list[i]) {
		assert(ctx.conf, 'A conflict should be reported');
		ctx.conf = false;
	    } else if(typeof list[i] === 'function') {
		list[i](pair[1]);
	    } else {
		throw new Error("Bad item in scenario");
	    }
	}
	done(ctx.conf ? new Error("A conflict was reported") : ctx.error);
    };
    ret.toString = function() {
	var str = 'function(){\ninit: ' + JSON.stringify(list[0]) + '\n';
	for(var i = 1; i < list.length; i++) {
	    if(typeof list[i] == 'object' && '_type' in list[i]) {
		str += 'patch: ' + JSON.stringify(list[i]) + '\n';
	    } else {
		str += list[i].toString() + '\n';
	    }
	}
	return str;
    };
    return ret;
}
