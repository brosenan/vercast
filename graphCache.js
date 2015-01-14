"use strict";
var vercast = require('vercast');
var LRU = require('lru').LRU;

module.exports = function(capacity) {
    var graphDB = new vercast.DummyGraphDB();
    var toDispose = [];
    
    var lru;
    function initLRU() {
	lru = new LRU(capacity);
	lru.on('evict', function(args) {
	    toDispose.push(args.key);
	});
    }
    initLRU();
    
    this.clear = function*() {
	yield* graphDB.clear();
	initLRU();
    };
    this.addEdge = function*(v1, e, v2) {
	lru.set(v1, v1);
	lru.set(v2, v2);
	yield* graphDB.addEdge(v1, e, v2);
	yield* cleanup();
    };
    this.queryEdge = function*(v1, e) {
	return yield* graphDB.queryEdge(v1, e);
    };
    this.queryBackEdge = function*(v2, e) {
	return yield* graphDB.queryBackEdge(v2, e);
    };
    this.findCommonAncestor = function*(v1, v2) {
	var res = yield* graphDB.findCommonAncestor(v1, v2);
	lru.set(res.node, res.node);
	res.p1.forEach(function(x) {
	    lru.set(x.n);
	});
	res.p2.forEach(function(x) {
	    lru.set(x.n);
	});
	return res;
    };
    this.findPath = function*(v1, v2) {
	return yield* graphDB.findPath(v1, v2);
    };

    function* cleanup() {
	for(let i = 0; i < toDispose.length; i++) {
	    yield* graphDB.remove(toDispose[i]);
	}
	toDispose = [];
    }
};