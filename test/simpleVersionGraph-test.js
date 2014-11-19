"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var SimpleVersionGraph = vercast.SimpleVersionGraph;
var DummyGraphDB = vercast.DummyGraphDB;
var util = require('/home/boaz/vercast-1/util.js');

var graphDB = new DummyGraphDB();
var versionGraph = new SimpleVersionGraph(graphDB);


function isPrime(x) {
    for(var i = 2; i <= Math.sqrt(x); i++) {
	if(x%i == 0) return false;
    }
    return true;
}
function* createGraph(aMax) {
    var a, b;
    for(a = 1; a < aMax; a += 1) {
	for(b = 1; b < a; b += 1) {
	    if(a%b == 0 && isPrime(a/b)) {
		yield* versionGraph.recordTrans({$:b}, {_type: 'mult', amount: a/b}, Math.log(a/b), {$:a});
	    }
	}
    }
}
describe('SimpleVersionGraph', function(){
    afterEach(function() {
	graphDB.abolish();
    });
    describe('.recordTrans(v1, p, w, v2)', function(){
	it('should return a callback with no error if all is OK', asyncgen.async(function*(){
	    yield* versionGraph.recordTrans({$:'foo'}, {_type: 'myPatch'}, 1, {$:'bar'});
	}));
    });
    describe('.getMergeStrategy(v1, v2, resolve)', function(){
	beforeEach(asyncgen.async(function*() {
	    yield* createGraph(30);
	}));
	it('should return x as the common ancestor of v1 and v2', asyncgen.async(function*(){
	    var mergeInfo = yield* versionGraph.getMergeStrategy({$:18}, {$:14}, false);
	    assert.equal(mergeInfo.x.$, 2);
	}));
	it('should return either v1 or v2 as V1, and the other as V2', asyncgen.async(function*(){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    var mergeInfo = yield* versionGraph.getMergeStrategy(v1, v2, false);
	    assert(mergeInfo.V1.$ == v1.$ || mergeInfo.V1.$ == v2.$, 'V1 should be either v1 or v2: ' + mergeInfo.V1.$);
	    assert(mergeInfo.V2.$ == v1.$ || mergeInfo.V2.$ == v2.$, 'V2 should be either v1 or v2: ' + mergeInfo.V2.$);
	    assert(mergeInfo.V1.$ != mergeInfo.V2.$ || v1.$ == v2.$, 'V1 and V2 should not be the same one');
	}));
	it('should set V1 and V2 such that the path between x and V2 is lighter than from x to V1, given that resolve=false', asyncgen.async(function*(){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    var mergeInfo = yield* versionGraph.getMergeStrategy(v1, v2, false);
	    assert((mergeInfo.V1.$ * 1) >= (mergeInfo.V2.$ * 1), 'V2 should be the lower of the two (closer to the GCD)');
	}));
	it('should set V1 and V2 to be v1 and v2 respectively if resolve=true', asyncgen.async(function*(){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    if((v1.$*1) > (v2.$*1)) {
		var tmp = v1;
		v1 = v2;
		v2 = tmp;
	    }
	    var mergeInfo = yield* versionGraph.getMergeStrategy(v1, v2, true);
	    assert.equal(v1, mergeInfo.V1);
	    assert.equal(v2, mergeInfo.V2);
	}));

    });
    describe('.recordMerge(mergeInfo, newV, patches, confPatches)', function(){
	beforeEach(asyncgen.async(function*() {
	    yield* createGraph(30);
	}));
	it('should record a merge using the mergeInfo object obtained from getMergeStrategy(), and a merged version', asyncgen.async(function*(){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    var mergeInfo = yield* versionGraph.getMergeStrategy(v1, v2, false);
	    yield* versionGraph.recordMerge(mergeInfo, {$:'newVersion'}, [], []);
	    yield* versionGraph.getMergeStrategy(v1, {$:'newVersion'}, false); // The new version should be in the graph
	}));
	it('should record the overall weight on each new edge', asyncgen.async(function*(){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    var v3 = {$:Math.floor(Math.random() * 29) + 1};
	    var v4 = {$:Math.floor(Math.random() * 29) + 1};
	    var mergeInfo = yield* versionGraph.getMergeStrategy(v1, v2, false);
	    var v12 = {$:v1.$ * v2.$ / mergeInfo.x.$};
	    yield* versionGraph.recordMerge(mergeInfo, v12, [], []);
	    var mergeInfo2 = yield* versionGraph.getMergeStrategy(v3, v4, false);
	    var v34 = {$:v3.$ * v4.$ / mergeInfo2.x.$};
	    yield* versionGraph.recordMerge(mergeInfo2, v34, [], []);
	    var mergeInfo3 = yield* versionGraph.getMergeStrategy(v12, v34, false);
	    assert(mergeInfo3.V2.$ <= mergeInfo3.V1.$, 'mergeInfo3.V1 should be lower');
	}));
    });
});
