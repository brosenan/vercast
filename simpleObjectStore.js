"use strict";
var vercast = require('vercast');

module.exports = function(disp, kvs) {
    this.init = function*(type, args) {
	var obj = yield* disp.init(createContext(this), type, args);
	var monitor = new vercast.ObjectMonitor(obj);
	var id = {$:monitor.hash()};
	Object.freeze(id);
	yield* kvs.store(id.$, obj);
	return id;
    };
    this.trans = function*(v, p, u, EQ) {
	var obj = yield* kvs.fetch(v.$);
	var monitor = new vercast.ObjectMonitor(obj);
	var res = yield* disp.apply(createContext(this, EQ), monitor.proxy(), p, u);
	var id = {$:monitor.hash()};
	Object.freeze(id);
	yield* kvs.store(id.$, obj);
	return {v: id, r: res};
    };

    function createContext(self, EQ) {
	return {
	    init: function*(type, args) {
		return yield* self.init(type, args);
	    },
	    trans: function*(v, p, u) {
		return yield* self.trans(v, p, u, EQ);
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
