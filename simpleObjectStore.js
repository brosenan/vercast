"use strict";
var vercast = require('vercast');

function SimpleObjectStorage(kvs) {
    this.storeNewObject = function*(ctx, obj) {
	var monitor = new vercast.ObjectMonitor(obj);
	var id = monitor.hash();
	yield* kvs.store(id, monitor.json());
	return id;
    };
    this.retrieve = function*(ctx, hash) {
	var json = yield* kvs.fetch(hash);
	if(typeof json === 'undefined') {
	    throw Error('No object version matching id: ' + v.$);
	}
	var obj = JSON.parse(json);
	return new vercast.ObjectMonitor(obj);
    };
    this.storeVersion = function*(ctx, v1, p, monitor, r, eff) {
	var v2 = monitor.hash();
	yield* kvs.store(v2, monitor.json());

	var pHash = vercast.ObjectMonitor.seal(p);
	var cachedKey = v1 + '>' + pHash;
	var retVal = {v: {$:v2}, r: r, eff: eff};
	yield* kvs.store(cachedKey, JSON.stringify(retVal));

	return v2;
    };
    this.checkCache = function*(v, p) {
	var pHash = vercast.ObjectMonitor.seal(p);
	var cachedKey = v + '>' + pHash;
	var cachedResult = yield* kvs.fetch(cachedKey);
	if(typeof cachedResult === 'string') {
	    return JSON.parse(cachedResult);
	}
    };
}

module.exports = function(disp, kvs) {
    var factory = new vercast.SequenceStoreFactory(kvs);
    return new vercast.ObjectStore(disp, factory, new SimpleObjectStorage(kvs));
};
