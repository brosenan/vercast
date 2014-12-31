"use strict";
var vercast = require('vercast');
var assert = require('assert');

exports.SimpleObjectStorage = function(kvs, prefix) {
    prefix = prefix || '';

    this.storeNewObject = function*(ctx, obj) {
	var monitor = new vercast.ObjectMonitor(obj);
	var id = monitor.hash();
	yield* kvs.store(id, monitor.json());
	return addPrefix(id);
    };
    this.retrieve = function*(ctx, hash) {
	var json = yield* kvs.fetch(removePrefix(hash));
	if(typeof json === 'undefined') {
	    throw Error('No object version matching id: ' + hash);
	}
	var obj = JSON.parse(json);
	return new vercast.ObjectMonitor(obj);
    };
    this.storeVersion = function*(ctx, v1, p, monitor, r, eff) {
	var v2 = monitor.hash();
	yield* kvs.store(v2, monitor.json());

	var pHash = vercast.ObjectMonitor.seal(p);
	var cachedKey = v1 + '>' + pHash;
	var retVal = {v: {$:addPrefix(v2)}, r: r, eff: eff};
	yield* kvs.store(cachedKey, JSON.stringify(retVal));

	return addPrefix(v2);
    };
    this.checkCache = function*(ctx, v, p) {
	var pHash = vercast.ObjectMonitor.seal(p);
	var cachedKey = v + '>' + pHash;
	var cachedResult = yield* kvs.fetch(cachedKey);
	if(typeof cachedResult === 'string') {
	    return JSON.parse(cachedResult);
	}
    };
    this.deriveContext = function() {};

    function addPrefix(id) {
	return prefix + id;
    }
    function removePrefix(id) {
	if(id.substr(0, prefix.length) === prefix) {
	    return id.substr(prefix.length);
	} else {
	    return id;
	}
    }
}

exports.SimpleObjectStore = function(disp, kvs) {
    var factory = new vercast.SequenceStoreFactory(kvs);
    return new vercast.ObjectStore(disp, factory, new exports.SimpleObjectStorage(kvs));
};
