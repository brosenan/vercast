"use strict";
exports.createValidatingBucket = function(createBucket) {
    var bucket = createBucket();
    return {
	store: function(obj, emit) {
	    return bucket.store(obj, emit);
	},
	storeIncoming: function(v, p, monitor, r, eff, emit) {
	    return bucket.storeIncoming(v, p, monitor, r, eff, emit);
	},
	storeOutgoing: function(v, p, monitor, r, eff, emit) {
	    return bucket.storeOutgoing(v, p, monitor, r, eff, emit);
	},
	storeInternal: function(v, p, monitor, r, eff, emit) {
	    return bucket.storeInternal(v, p, monitor, r, eff, emit);
	},
    };
};