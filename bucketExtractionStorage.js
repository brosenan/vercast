"use strict";

var vercast = require('vercast');
var asyncgen = require('asyncgen');

module.exports = function(disp) {
    var ctx = {};
    return function(name) {
	var kvs = new vercast.DummyKeyValueStore();
	var seq = new vercast.SequenceStoreFactory(kvs);
	var internalStorage = new vercast.SimpleObjectStorage(kvs);
	internalStorage.foo = 23;
	var internalOStore = new vercast.ObjectStore(disp, seq, internalStorage);

	return {
	    store: function(obj, emit) {
		emit({type: 'seed', obj: obj});
		asyncgen.runSync(function*() {
		    yield* internalStorage.storeNewObject(ctx, obj);
		});
		var monitor = new vercast.ObjectMonitor(obj);
		return monitor.hash();
	    },
	    checkCache: function(v, p) {
		var split = v.split('-');
		return asyncgen.runSync(function*() {
		    return yield* internalStorage.checkCache(ctx, split[1], p);
		});
	    },
	    retrieve: function(id) {
		return asyncgen.runSync(function*() {
		    return yield* internalStorage.retrieve(ctx, id);
		});
	    },
	    add: function(elem) {
		if(elem.type === 'seed') {
		    asyncgen.runSync(function*() {
			yield* internalStorage.storeNewObject(ctx, elem.obj);
		    });
		} else if(elem.type === 'patch') {
		    asyncgen.runSync(function*() {
			yield* internalOStore.trans({$:elem.v}, elem.p);
		    });
		} else if(elem.type === 'cache') {
		    asyncgen.runSync(function*() {
			var pHash = vercast.ObjectMonitor.seal(elem.p);
			var cachedKey = elem.v + '>' + pHash;
			var retVal = {v: {$:elem.v2}, r: elem.r, eff: elem.eff};
			yield* kvs.store(cachedKey, JSON.stringify(retVal));
		    });
		}
	    },
	    storeOutgoing: function(v, p, monitor, r, eff, emit) {
		var split = v.split('-');
		var v2 = [split[0], monitor.hash()].join('-');
		emit({type: 'cache', 
		      v: v, 
		      v2 : v2, 
		      p: p, r: r, eff: eff});
		asyncgen.runSync(function*() {
		    var pHash = vercast.ObjectMonitor.seal(p);
		    var cachedKey = v + '>' + pHash;
		    var retVal = {v: {$:v2}, r: r, eff: eff};
		    yield* kvs.store(cachedKey, JSON.stringify(retVal));
		});
	    },
	    storeIncoming: function(v, p, monitor, r, eff, emit) {
		var split = v.split('-');
		emit({type: 'patch', v: split[1], p: p});
		asyncgen.runSync(function*() {
		    yield* internalStorage.storeVersion(ctx, v, p, monitor, r, eff);
		});
		
		return monitor.hash();
	    },
	    storeInternal: function(v, p, monitor, r, eff, emit) {
		var split = v.split('-');
		var v2 = [split[0], monitor.hash()].join('-');
		asyncgen.runSync(function*() {
		    var pHash = vercast.ObjectMonitor.seal(p);
		    var cachedKey = split[1] + '>' + pHash;
		    var retVal = {v: {$:v2}, r: r, eff: eff};
		    yield* kvs.store(cachedKey, JSON.stringify(retVal));
		    yield* internalStorage.storeVersion(ctx, v, p, monitor, r, eff);
		});
		
		return monitor.hash();
	    },
	};
    }
}
function removeBucketID(obj, id) {
    var prefix = id + '-';
    if(!obj || typeof obj !== 'object') {
	return obj;
    }

    if(obj.$) {
	if(obj.$.substr(0, prefix.length) === prefix) {
	    return {$: obj.$.substr(prefix.length)};
	} else {
	    return obj;
	}
    } else {
	var newObj = Object.create(null);
	Object.keys(obj).forEach(function(key) {
	    newObj[key] = removeBucketID(obj[key], id);
	});
	return newObj;
    }
}