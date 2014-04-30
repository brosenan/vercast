var assert = require('assert');
var DummyBucketStore = require('../dummyBucketStore.js');
var vercast = require('../vercast.js');
var SimpleVersionGraph = require('../simpleVersionGraph.js');
var Scheduler = require('../scheduler.js');
var DummyGraphDB = require('../dummyGraphDB.js');
var util = require('../util.js');

var graphDB = new DummyGraphDB();
var sched = new Scheduler();
var bucketStore = new DummyBucketStore(sched);
var versionGraph = new SimpleVersionGraph(graphDB, bucketStore);


function isPrime(x) {
    for(var i = 2; i <= Math.sqrt(x); i++) {
	if(x%i == 0) return false;
    }
    return true;
}
function createGraph(a, b, aMax, done) {
    while(a < aMax) {
	while(b < a) {
	    if(a%b == 0 && isPrime(a/b)) {
		versionGraph.recordTrans({$:b}, {_type: 'mult', amount: a/b}, Math.log(a/b), {$:a}, function(err) {
		    if(err) done(err);
		    createGraph(a, b+1, aMax, done);
		});
		return;
	    }
	    b++;
	}
	b = 1;
	a++;
    }
    done();
}
describe('SimpleVersionGraph', function(){
    afterEach(function() {
	bucketStore.abolish();
	graphDB.abolish();
    });
    describe('.recordTrans(v1, p, w, v2, cb(err))', function(){
	it('should return a callback with no error if all is OK', function(done){
	    versionGraph.recordTrans({$:'foo'}, {_type: 'myPatch'}, 1, {$:'bar'}, done);
	});
    });
    describe('.getMergeStrategy(v1, v2, cb(err, V1, x, V2, mergeInfo))', function(){
	beforeEach(function(done) {
	    createGraph(1, 1, 30, done);
	});
	it('should return x as the common ancestor of v1 and v2', function(done){
	    util.seq([
		function(_) { versionGraph.getMergeStrategy({$:18}, {$:14}, _.to('V1', 'x', 'V2')); },
		function(_) { assert.equal(this.x.$, 2); _(); }, // x here represents the GCD of v1 and v2
	    ], done)();
	});
	it('should return either v1 or v2 as V1, and the other as V2', function(done){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    util.seq([
		function(_) { versionGraph.getMergeStrategy(v1, v2, _.to('V1', 'x', 'V2')); },
		function(_) { assert(this.V1.$ == v1.$ || this.V1.$ == v2.$, 'V1 should be either v1 or v2: ' + this.V1.$);
			      assert(this.V2.$ == v1.$ || this.V2.$ == v2.$, 'V2 should be either v1 or v2: ' + this.V2.$);
			      assert(this.V1.$ != this.V2.$ || v1.$ == v2.$, 'V1 and V2 should not be the same one');
			      _();},
	    ], done)();
	});
	it('should set V1 and V2 such that the path between x and V2 is lighter than from x to V1', function(done){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    util.seq([
		function(_) { versionGraph.getMergeStrategy(v1, v2, _.to('V1', 'x', 'V2')); },
		function(_) { assert((this.V1.$ * 1) >= (this.V2.$ * 1), 'V2 should be the lower of the two (closer to the GCD)');
			      _();},
	    ], done)();
	    
	});
    });
    describe('.getPatches(v1, v2, cb(err, patches))', function(){
	beforeEach(function(done) {
	    createGraph(1, 1, 30, done);
	});
	it('should return the patches along the path between v1 and v2 (here, v1 is an ancestor of v2)', function(done){
	    util.seq([
		function(_) { versionGraph.getPatches({$:2}, {$:18}, _.to('patches')); },
		function(_) { 
		    var m = 1;
		    for(var i = 0; i < this.patches.length; i++) {
			assert.equal(this.patches[i]._type, 'mult');
			m *= this.patches[i].amount;
		    }
		    assert.equal(m, 9);
		    _();
		},
	    ], done)();
	});
	it('should expand patches that result from previous merges', function(done){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    util.seq([
		function(_) { versionGraph.getMergeStrategy(v1, v2, _.to('V1', 'x', 'V2', 'mergeInfo')); },
		function(_) { versionGraph.recordMerge(this.mergeInfo, {$:'newVersion'}, _); },
		function(_) { versionGraph.getPatches(v1, {$:'newVersion'}, _.to('patches')); },
		function(_) { 
		    var m = 1;
		    for(var i = 0; i < this.patches.length; i++) {
			assert.equal(this.patches[i]._type, 'mult');
			m *= this.patches[i].amount;
		    }
		    assert.equal(m, v2.$/this.x.$);
		    _();
		},
	    ], done)();
	});

    });
    describe('.recordMerge(mergeInfo, newV, cb(err))', function(){
	beforeEach(function(done) {
	    createGraph(1, 1, 30, done);
	});
	it('should record a merge using the mergeInfo object obtained from getMergeStrategy(), and a merged version', function(done){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    util.seq([
		function(_) { versionGraph.getMergeStrategy(v1, v2, _.to('V1', 'x', 'V2', 'mergeInfo')); },
		function(_) { versionGraph.recordMerge(this.mergeInfo, {$:'newVersion'}, _); },
		function(_) { versionGraph.getPatches(v1, {$:'newVersion'}, _); }, // The new version should be in the graph
	    ], done)();
	});
    });
});