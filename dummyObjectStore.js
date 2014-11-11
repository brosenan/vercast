"use strict";

var vercast = require('vercast');


module.exports = function(disp) {
    var effSeqFactory = new vercast.SequenceStoreFactory(new vercast.DummyKeyValueStore());
    this.init = function*(type, args) {
	var obj = yield* disp.init(createContext(this), type, args);
	return {$:JSON.stringify(obj)};
    };
    this.trans = function*(v, p, u) {
	var effSeq = effSeqFactory.createSequenceStore();
	var obj = JSON.parse(v.$);
	var r = yield* disp.apply(createContext(this, effSeq), obj, p, u);
	return {r: r, 
		v: {$:JSON.stringify(obj)},
		eff: yield* effSeq.hash()};
    };
    this.getSequenceStore = function() {
	return effSeqFactory.createSequenceStore();
    };

};
function createContext(self, effSeq) {
    return {
	init: function*(type, args) {
	    return yield* self.init(type, args);
	},
	trans: function*(v, p, u) {
	    var res = yield* self.trans(v, p, u);
	    yield* effSeq.append(res.eff);
	    return res;
	},
	conflict: function(reason) {
	    var err = Error(reason);
	    err.isConflict = true;
	    throw err;
	},
	effect: function*(p) {
	    yield* effSeq.append(p);
	},
    };
}
module.exports.createContext = createContext;
