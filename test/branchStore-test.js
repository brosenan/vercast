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

var stateStore = createBranchStore({BinTree: require('../binTree.js')});

