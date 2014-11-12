"use strict";

var vercast = require('vercast');

module.exports = function(dispMap, type, args) {
    var disp = new vercast.ObjectDispatcher(dispMap);
    var ostore = new vercast.DummyObjectStore(disp);
    var v;
    function* initialize() {
	if(v) {
	    return;
	}
	v = yield* ostore.init(type, args);
    }

    this.trans = function*(p) {
	yield* initialize();
	var res = yield* ostore.trans(v, p);
	v = res.v;
	return res.r;
    };
};