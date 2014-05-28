var assert = require('assert');
var ObjectDisp = require('../objectDisp.js');
var BucketObjectStore = require('../bucketObjectStore.js');
var SimpleCache = require('../simpleCache.js');
var vercast = require('../vercast.js');
var DummyBucketStore = require('../dummyBucketStore.js');
var AsyncObjectStore = require('../asyncObjectStore.js');
var Scheduler = require('../scheduler.js');
var MergingStateStore = require('../mergingStateStore.js');
var SimpleVersionGraph = require('../simpleVersionGraph.js');
var DummyGraphDB = require('../dummyGraphDB.js');
var util = require('../util.js');
var BranchStore = require('../branchStore.js');
var AtomicKVS = require('../dummyAtomicKVS.js');


var sched = new Scheduler();
var cache = new SimpleCache(sched);
var bucketStore = new DummyBucketStore(sched);
bucketStore.async = true;
var graphDB = new DummyGraphDB();
var versionGraph = new SimpleVersionGraph(graphDB);
var atomicStore = new AtomicKVS();

function createBranchStore(handlers) {
    var disp = new ObjectDisp(handlers);
    var ostore = new BucketObjectStore(disp, cache, bucketStore);
    var stateStore = new AsyncObjectStore(ostore, sched);
    var mergingStateStore = new MergingStateStore(stateStore, versionGraph);
    return new BranchStore(mergingStateStore, atomicStore);
}

var branchStore = createBranchStore({BinTree: require('../binTree.js')});

describe('BranchStore', function(){
    afterEach(function() { 
	graphDB.abolish();
	atomicStore.abolish(); 
    });
    describe('.init(className, args, cb(err, v0))', function(){});
    describe('.trans(v1, p, cb(v2, r, c))', function(){});
    describe('.fork(name, v0, cb(err))', function(){
	it('should create a new branch of the given name, and set its head version to v0', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v')); },
		function(_) { branchStore.fork('b1', this.v, _); },
		function(_) { assert.deepEqual(branchStore.head('b1'), this.v); _(); },
	    ], done)();
	});

    });
    describe('.head(branchName)', function(){
	it('should return the last known version of the given branch', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v')); },
		function(_) { branchStore.fork('b1', this.v, _); },
		function(_) { assert.deepEqual(branchStore.head('b1'), this.v); _(); },
	    ], done)();
	});
    });
    describe('.push(branchName, v2, cb(err))', function(){
	it('should assign v2 to the head of the branch, if v2 is a descendant of the current head', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v')); },
		function(_) { branchStore.fork('b1', this.v, _); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v2')); },
		function(_) { branchStore.push('b1', this.v2, _); },
		function(_) { assert.deepEqual(branchStore.head('b1'), this.v2); _(); },
	    ], done)();
	});
	it('should merge the head version and v2 if not a direct descendant', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v')); },
		function(_) { branchStore.fork('b1', this.v, _); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { branchStore.push('b1', this.v1, _); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { branchStore.push('b1', this.v2, _); },
		function(_) { branchStore.trans(branchStore.head('b1'), {_type: 'fetch', key: 'foo'}, _.to('v3', 'r')); },
		function(_) { assert.equal(this.r, 'FOO'); _(); },
		function(_) { branchStore.trans(branchStore.head('b1'), {_type: 'fetch', key: 'bar'}, _.to('v3', 'r')); },
		function(_) { assert.equal(this.r, 'BAR'); _(); },
	    ], done)();
	});
	it('should fail if a conflict is encountered', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v')); },
		function(_) { branchStore.fork('b1', this.v, _); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { branchStore.push('b1', this.v1, _); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO2'}, _.to('v2')); },
		function(_) { branchStore.push('b1', this.v2, _); },
		function(_) { assert(false, 'push() should fail'); _(); },
	    ], function(err) {
		if(err.conflict) done();
		else done(err);
	    })();
	});
	it('should handle cases where two pushes are done in parallel. If no conflicts occur, the resulting head should include all contributions', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v')); },
		function(_) { branchStore.fork('b1', this.v, _); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { var para = util.parallel(2, _); 
			      branchStore.push('b1', this.v1, para);
			      branchStore.push('b1', this.v2, para); },
		function(_) { branchStore.trans(branchStore.head('b1'), {_type: 'fetch', key: 'foo'}, _.to('v3', 'r')); },
		function(_) { assert.equal(this.r, 'FOO'); _(); },
		function(_) { branchStore.trans(branchStore.head('b1'), {_type: 'fetch', key: 'bar'}, _.to('v3', 'r')); },
		function(_) { assert.equal(this.r, 'BAR'); _(); },
	    ], done)();
	});
    });
    describe('.pull(v1, versionOrBranch, cb(err, vm))', function(){
	it('should merge between the two versions (if so given)', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v')); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { branchStore.pull(this.v1, this.v2, _.to('vm')); },
		function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('v3', 'r')); },
		function(_) { assert.equal(this.r, 'FOO'); _(); },
		function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'bar'}, _.to('v3', 'r')); },
		function(_) { assert.equal(this.r, 'BAR'); _(); },
	    ], done)();
	});

    });

});
