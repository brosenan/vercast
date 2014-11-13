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
    
    (function() {
	var ostore2 = new vercast.DummyObjectStore(disp);
	function* reversibilityChecker(v1, p, u, v2, r, eff) {
	    var res = yield* ostore2.trans(v2, p, !u);
	    if(res.v.$ !== v1.$) {
		var obj = JSON.parse(v1.$);
		throw Error('Transformation "' + p._type + '" for type "' + obj._type + '" is not reversible');
	    }
	}
	ostore.addTransListener(reversibilityChecker);
    })();
    
    (function() {
	var verMap = {};
	var ostore2 = new vercast.DummyObjectStore(disp);
	function* commutativityChecker(v1, p, u, v2, r, eff) {
	    if(v1.$ in verMap) {
		var prev = verMap[v1.$];
		var alt = yield* ostore2.trans(prev.v1, p, u);
		alt = yield* ostore2.trans(alt.v, prev.p, prev.u);
		if(alt.v.$ !== v2.$) {
		    var obj = JSON.parse(v1.$);
		    throw Error('Transformations "' + prev.p._type + '" and "' +
				p._type + '" for type "' + obj._type + 
				'" are independent but do not commute');
		}
	    }
	    verMap[v2.$] = {v1: v1, p: p, u: u, r: r};
	};
	ostore.addTransListener(commutativityChecker);
    })();

};

