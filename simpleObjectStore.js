"use strict";
var vercast = require('vercast');

module.exports = function(disp, kvs) {
    this.init = function*(type, args) {
	var obj = yield* disp.init(vercast.DummyObjectStore.createContext(this), type, args);
	var monitor = new vercast.ObjectMonitor(obj);
	var id = {$:monitor.hash()};
	Object.freeze(id);
	yield* kvs.store(id.$, JSON.stringify(obj));
	return id;
    };
    this.trans = function*(v, p, u, EQ) {
	if(typeof v.$ === 'undefined') {
	    throw Error('undefined version ID');
	}
	var json = yield* kvs.fetch(v.$);
	if(typeof json === 'undefined') {
	    throw Error('No object version matching id: ' + v.$);
	}
	
	// Check for a cached result
	var pHash = vercast.ObjectMonitor.seal(p);
	var cachedKey = v.$ + '>' + pHash;
	var cachedResult = yield* kvs.fetch(cachedKey);
	if(typeof cachedResult === 'string') {
	    return JSON.parse(cachedResult);
	}

	var obj = JSON.parse(json);
	var monitor = new vercast.ObjectMonitor(obj);
	var res = yield* disp.apply(vercast.DummyObjectStore.createContext(this, EQ), monitor.proxy(), p, u);
	var id = {$:monitor.hash()};
	Object.freeze(id);
	yield* kvs.store(id.$, JSON.stringify(obj));

	// Cache the result
	var retVal = {v: id, r: res};
	yield* kvs.store(cachedKey, JSON.stringify(retVal));
	return retVal;
    };
};
