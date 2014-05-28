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
});
