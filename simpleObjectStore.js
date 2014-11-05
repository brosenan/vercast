"use strict";

module.exports = function(disp) {
    this.init = function*(type, args) {
	var obj = yield* disp.init(createContext(this), type, args);
	return {$:JSON.stringify(obj)};
    };
    this.trans = function*(v, p, u, EQ) {
	var obj = JSON.parse(v.$);
	var r = yield* disp.apply(createContext(this, EQ), obj, p, u);
	return {r: r, v: {$:JSON.stringify(obj)}};
    };

    function createContext(self, EQ) {
	return {
	    init: function*(type, args) {
		return yield* self.init(type, args);
	    },
	    trans: function*(v, p, u) {
		return yield* self.trans(v, p, u);
	    },
	    conflict: function(reason) {
		var err = Error(reason);
		err.isConflict = true;
		throw err;
	    },
	    effect: function*(p) {
		yield* EQ.enqueue(p);
	    },
	};
    }
};
