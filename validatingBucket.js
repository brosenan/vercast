"use strict";
var assert = require('assert');

exports.createValidatingBucket = function(createBucket) {
    var bucket1 = createBucket();
    var bucket2 = createBucket();

    function emitFunc(emit) {
	return function(elem) {
	    bucket2.add(elem);
	    emit(elem);
	}
    }
    return {
	store: function(obj, emit) {
	    return bucket1.store(obj, emitFunc(emit));
	},
	storeIncoming: function(v, p, monitor, r, eff, emit) {
	    return bucket1.storeIncoming(v, p, monitor, r, eff, emitFunc(emit));
	},
	storeOutgoing: function(v, p, monitor, r, eff, emit) {
	    return bucket1.storeOutgoing(v, p, monitor, r, eff, emitFunc(emit));
	},
	storeInternal: function(v, p, monitor, r, eff, emit) {
	    return bucket1.storeInternal(v, p, monitor, r, eff, emitFunc(emit));
	},
	checkCache: function(v, p) {
	    return bucket1.checkCache(v, p);
	},
	retrieve: function(id) {
	    var monitor1 = bucket1.retrieve(id);
	    var monitor2 = bucket2.retrieve(id);
	    //console.log(monitor1.object(), monitor2.object());
	    assert.deepEqual(monitor1.object(), monitor2.object(), 'Mismatch in return value between stored and added state');
	    return monitor1;
	},
	add: function(elem) {
	    bucket1.add(elem);
	},
    };
};