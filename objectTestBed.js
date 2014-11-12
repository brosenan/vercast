"use strict";

var vercast = require('vercast');

module.exports = function(dispMap, type, args) {
    var disp = new vercast.ObjectDispatcher(dispMap);
    var ostore = new vercast.DummyObjectStore(disp);
    ostore.addTransListener(reversibilityChecker);
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

    var ostore2 = new vercast.DummyObjectStore(disp);
    function* reversibilityChecker(v1, p, u, v2, r, eff) {
	var res = yield* ostore2.trans(v2, p, !u);
	if(res.v.$ !== v1.$) {
	    var obj = JSON.parse(v1.$);
	    throw Error('Transformation "' + p._type + '" for type "' + obj._type + '" is not reversible');
	}
    }

};

