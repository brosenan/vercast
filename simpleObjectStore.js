"use strict";

module.exports = function(disp) {
    this.init = function*(type, args) {
	var obj = yield* disp.init(createContext(this), type, args);
	return {$:JSON.stringify(obj)};
    };
    this.trans = function*(v, p, u) {
	var obj = JSON.parse(v.$);
	var r = yield* disp.apply(createContext(this), obj, p, u);
	return {r: r, v: {$:JSON.stringify(obj)}};
    };

    function createContext(self) {
	return {
	    init: function*(type, args) {
		return yield* self.init(type, args);
	    },
	};
    }
};
