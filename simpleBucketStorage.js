"use strict";

var vercast = require('vercast');

function store(monitor, emit) {
    var id = monitor.hash()
    emit({id: id, val: monitor.json()});
    return id; 
}
function cacheKey(v, p) {
    return v + ':' + vercast.ObjectMonitor.seal(p);
}
function createBucket() {
    var kvs = Object.create(null);
    var cache = Object.create(null);

    return {
	checkCache: function(v, p) {
	    return cache[cacheKey(v, p)];
	},
	store: function(obj, emit) {
	    var monitor = new vercast.ObjectMonitor(obj);
	    emit({id: monitor.hash(),
		  val: monitor.json()});
	    return monitor.hash();
	},
	retrieve: function(id) {
	    if(!kvs[id]) {
		throw Error('Invalid ID: ' + id);
	    }
	    return new vercast.ObjectMonitor(JSON.parse(kvs[id]));
	},
	storeOutgoing: function(v, p, monitor, r, eff, emit) {
	    cacheResult(v, p, monitor, this.name, r, eff);
	},
	storeIncoming: function(v, p, monitor, r, eff, emit) {
	    cacheResult(v, p, monitor, this.name, r, eff);
	    return store(monitor, emit);
	},
	storeInternal: function(v, p, monitor, r, eff, emit) {
	    cacheResult(v, p, monitor, this.name, r, eff);
	    return store(monitor, emit);
	},
	add: function(elem) {
	    kvs[elem.id] = elem.val;
	},
    };

    function cacheResult(v, p, monitor, name, r, eff) {
	cache[cacheKey(v, p)] = {v: {$:name + '-' + monitor.hash()}, 
				 r: r, eff: eff};
    }
}

module.exports = function(bucketStore) {
    return new vercast.BucketObjectStorage(bucketStore, createBucket);
};