"use strict";

module.exports = function(ostore) {
    this.init = function(type, args) {
	return ostore.init(type, args);
    };
    this.trans = function*(v, p, u) {
	var seq = ostore.getSequenceStore();
	yield* seq.append(p);
	var res;
	while(!seq.isEmpty()) {
	    var p = yield* seq.shift();
	    res = yield* ostore.trans(v, p, u);
	    yield* seq.append(res.eff);
	    v = res.v;
	}
	return res;
    };
};
