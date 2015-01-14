"use strict";
var vercast = require('vercast');

module.exports = function(externalGraphDB, bucketStore, capacity, clusteringFunc) {
    var cache = new vercast.GraphCache(capacity, true);

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
	    yield* bucketStore.append(c2, [{v1: v1, e: e, v2: v2}]);
	}
	yield* bucketStore.append(c1, [{v1: v1, e: e, v2: v2}]);
	yield* cache.addEdge(v1, e, v2);
	yield* cache.cleanup();
    };
    this.queryEdge = function*(v1, e) {
	yield* extractBucket(clusteringFunc(v1));
	var res = yield* cache.queryEdge(v1, e);
	yield* cache.cleanup();
	return res;
    };
    this.queryBackEdge = function*(v2, e) {
	yield* extractBucket(clusteringFunc(v2));
	var res = yield* cache.queryBackEdge(v2, e);
	yield* cache.cleanup();
	return res;
    };
    this.findCommonAncestor = function*(v1, v2) {
	var c1 = clusteringFunc(v1);
	var c2 = clusteringFunc(v2);
 	if(c1 !== c2) {
	    var clusterLCA = yield* externalGraphDB.findCommonAncestor(c1, c2);
	    yield* extractBucket(clusterLCA.node);
	    for(let i = 0; i < clusterLCA.p1.length; i++) {
		yield* extractBucket(clusterLCA.p1[i].n);
	    }
	    for(let i = 0; i < clusterLCA.p2.length; i++) {
		yield* extractBucket(clusterLCA.p2[i].n);
	    }
	}
	var res = yield* cache.findCommonAncestor(v1, v2);
	yield* cache.cleanup();
	return res;
    };
    this.findPath = function*(v1, v2) {
	var c1 = clusteringFunc(v1);
	var c2 = clusteringFunc(v2);
 	if(c1 !== c2) {
	    var clusterLCA = yield* externalGraphDB.findCommonAncestor(c1, c2);
	    yield* extractBucket(clusterLCA.node);
	    for(let i = 0; i < clusterLCA.p2.length; i++) {
		yield* extractBucket(clusterLCA.p2[i].n);
	    }
	}
	var res = yield* cache.findPath(v1, v2);
	yield* cache.cleanup();
	return res;
    };

    function* extractBucket(id) {
	var bucket = yield* bucketStore.retrieve(id);
	for(let i = 0; i < bucket.length; i++) {
	    var elem = bucket[i];
	    yield* cache.addEdge(elem.v1, elem.e, elem.v2);
	}
    }
};