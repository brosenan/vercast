"use strict";
var vercast = require('vercast');

module.exports = function(externalGraphDB, bucketStore, capacity, clusteringFunc) {
    var cache = new vercast.GraphCache(capacity);

    this.clear = function*() {
	yield* externalGraphDB.clear();
	yield* cache.clear();
	yield* bucketStore.clear();
    };
    this.addEdge = function*(v1, e, v2) {
	var c1 = clusteringFunc(v1);
	var c2 = clusteringFunc(v2);
	if(c1 !== c2) {
	    yield* externalGraphDB.addEdge(c1, e, c2);
	}
	yield* bucketStore.append(c1, [{v1: v1, e: e, v2: v2}]);
	yield* cache.addEdge(v1, e, v2);
    };
    this.queryEdge = function*(v1, e) {
//	if(!cache.has(v1)) {
//	    yield* extractBucket(clusteringFunc(v1));
//	}
	return yield* cache.queryEdge(v1, e);
    };
    this.queryBackEdge = function*(v2, e) {
	return yield* cache.queryBackEdge(v2, e);
    };
    this.findCommonAncestor = function*(v1, v2) {
	var c1 = clusteringFunc(v1);
	var c2 = clusteringFunc(v2);
// 	if(c1 !== c2) {
//	    var clusterLCA = yield* externalGraphDB.findCommonAncestor(c1, c2);
//	    yield* extractBucket(clusterLCA.node);
//	    for(let i = 0; i < clusterLCA.p1.length; i++) {
//		yield* extractBucket(clusterLCA.p1[i].n);
//	    }
//	    for(let i = 0; i < clusterLCA.p2.length; i++) {
//		yield* extractBucket(clusterLCA.p2[i].n);
//	    }
//	}
	return yield* cache.findCommonAncestor(v1, v2);
    };
    this.findPath = function*(v1, v2) {
	var c1 = clusteringFunc(v1);
	var c2 = clusteringFunc(v2);
// 	if(c1 !== c2) {
//	    var clusterLCA = yield* externalGraphDB.findCommonAncestor(c1, c2);
//	    yield* extractBucket(clusterLCA.node);
//	    for(let i = 0; i < clusterLCA.p2.length; i++) {
//		yield* extractBucket(clusterLCA.p2[i].n);
//	    }
//	}
	return yield* cache.findPath(v1, v2);
    };

    function* extractBucket(id) {
	var bucket = yield* bucketStore.retrieve(id);
	for(let i = 0; i < bucket.length; i++) {
	    var elem = bucket[i];
	    yield* cache.addEdge(elem.v1, elem.e, elem.v2);
	}
    }
};