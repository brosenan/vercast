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
    describe('.getMergeStrategy(v1, v2, resolve, cb(err, V1, x, V2, mergeInfo))', function(){
	beforeEach(function(done) {
	    createGraph(1, 1, 30, done);
	});
	it('should return x as the common ancestor of v1 and v2', function(done){
	    util.seq([
		function(_) { versionGraph.getMergeStrategy({$:18}, {$:14}, false, _.to('V1', 'x', 'V2')); },
		function(_) { assert.equal(this.x.$, 2); _(); }, // x here represents the GCD of v1 and v2
	    ], done)();
	});
	it('should return either v1 or v2 as V1, and the other as V2', function(done){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    util.seq([
		function(_) { versionGraph.getMergeStrategy(v1, v2, false, _.to('V1', 'x', 'V2')); },
		function(_) { assert(this.V1.$ == v1.$ || this.V1.$ == v2.$, 'V1 should be either v1 or v2: ' + this.V1.$);
			      assert(this.V2.$ == v1.$ || this.V2.$ == v2.$, 'V2 should be either v1 or v2: ' + this.V2.$);
			      assert(this.V1.$ != this.V2.$ || v1.$ == v2.$, 'V1 and V2 should not be the same one');
			      _();},
	    ], done)();
	});
	it('should set V1 and V2 such that the path between x and V2 is lighter than from x to V1, given that resolve=false', function(done){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    util.seq([
		function(_) { versionGraph.getMergeStrategy(v1, v2, false, _.to('V1', 'x', 'V2')); },
		function(_) { assert((this.V1.$ * 1) >= (this.V2.$ * 1), 'V2 should be the lower of the two (closer to the GCD)');
			      _();},
	    ], done)();
	    
	});
	it('should set V1 and V2 to be v1 and v2 respectively if resolve=true', function(done){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    if((v1.$*1) > (v2.$*1)) {
		var tmp = v1;
		v1 = v2;
		v2 = tmp;
	    }
	    util.seq([
		function(_) { versionGraph.getMergeStrategy(v1, v2, true, _.to('V1', 'x', 'V2')); },
		function(_) { assert.equal(v1, this.V1);
			      assert.equal(v2, this.V2);
			      _();},
	    ], done)();
	});

    });
    describe('.recordMerge(mergeInfo, newV, patches, confPatches, cb(err))', function(){
	beforeEach(function(done) {
	    createGraph(1, 1, 30, done);
	});
	it('should record a merge using the mergeInfo object obtained from getMergeStrategy(), and a merged version', function(done){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    util.seq([
		function(_) { versionGraph.getMergeStrategy(v1, v2, false, _.to('V1', 'x', 'V2', 'mergeInfo')); },
		function(_) { versionGraph.recordMerge(this.mergeInfo, {$:'newVersion'}, [], [], _); },
		function(_) { versionGraph.getMergeStrategy(v1, {$:'newVersion'}, false, _); }, // The new version should be in the graph
	    ], done)();
	});
	it('should record the overall weight on each new edge', function(done){
	    var v1 = {$:Math.floor(Math.random() * 29) + 1};
	    var v2 = {$:Math.floor(Math.random() * 29) + 1};
	    var v3 = {$:Math.floor(Math.random() * 29) + 1};
	    var v4 = {$:Math.floor(Math.random() * 29) + 1};
	    util.seq([
		function(_) { versionGraph.getMergeStrategy(v1, v2, false, _.to('V1', 'x', 'V2', 'mergeInfo')); },
		function(_) { this.v12 = {$:v1.$ * v2.$ / this.x.$};
			      versionGraph.recordMerge(this.mergeInfo, this.v12, [], [], _); },
		function(_) { versionGraph.getMergeStrategy(v3, v4, false, _.to('V3', 'x', 'V4', 'mergeInfo')); },
		function(_) { this.v34 = {$:v3.$ * v4.$ / this.x.$};
			      versionGraph.recordMerge(this.mergeInfo, this.v34, [], [], _); },
		function(_) { versionGraph.getMergeStrategy(this.v12, this.v34, false, _.to('V5', 'x', 'V6')); },
		function(_) { assert(this.V6.$ <= this.V5.$, 'V6 should be lower'); _(); },
	    ], done)();
	});
    });
});
