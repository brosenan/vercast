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

var sched = new Scheduler();
var cache = new SimpleCache(sched);
var bucketStore = new DummyBucketStore(sched);
bucketStore.async = true;
var graphDB = new DummyGraphDB();
var versionGraph = new SimpleVersionGraph(graphDB);

function createMergingStateStore(handlers) {
    var disp = new ObjectDisp(handlers);
    var ostore = new BucketObjectStore(disp, cache, bucketStore);
    var stateStore = new AsyncObjectStore(ostore, sched);
    return new MergingStateStore(stateStore, versionGraph);
}

var stateStore = createMergingStateStore({BinTree: require('../binTree.js')});

describe('MergingStateStore', function(){
    afterEach(function() {
	cache.abolish();
	bucketStore.abolish();
	graphDB.abolish();
    });
    describe('.init(className, args, cb(v0))', function(){});
    describe('.trans(v1, p, cb(v2, r, c))', function(){
	it('should apply p to v1 to receive v2', function(done){
	    util.seq([
		function(_) { stateStore.init('BinTree', {}, _.to('v')); },
		function(_) { stateStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v')); },
		function(_) { stateStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v')); },
		function(_) { stateStore.trans(this.v, {_type: 'fetch', key: 'foo'}, _.to('v', 'r')); },
		function(_) { assert.equal(this.r, 'FOO'); _(); },
	    ], done)();
	});
    });
    describe('.merge(v1, v2[, resolve], cb(err, vm))', function(){
	it('should return version vm which is a merge of both versions v1 and v2', function(done){
	    util.seq([
		function(_) { stateStore.init('BinTree', {}, _.to('v0')); },
		function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { stateStore.merge(this.v1, this.v2, _.to('vm')); },
		function(_) { stateStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('v', 'r')); },
		function(_) { assert.equal(this.r, 'FOO'); _(); },
		function(_) { stateStore.trans(this.vm, {_type: 'fetch', key: 'bar'}, _.to('v', 'r')); },
		function(_) { assert.equal(this.r, 'BAR'); _(); },
	    ], done)();
	});
	it('should record the merge so that further merges would work', function(done){
	    util.seq([
		function(_) { stateStore.init('BinTree', {}, _.to('v0')); },
		function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { stateStore.merge(this.v1, this.v2, _.to('v1')); }, // merge once
		function(_) { stateStore.trans(this.v2, {_type: 'add', key: 'baz', value: 'BAZ'}, _.to('v2')); },
		function(_) { stateStore.merge(this.v1, this.v2, _.to('v1')); }, // merge twice
		function(_) { stateStore.trans(this.v1, {_type: 'fetch', key: 'foo'}, _.to('v', 'r')); },
		function(_) { assert.equal(this.r, 'FOO'); _(); },
		function(_) { stateStore.trans(this.v1, {_type: 'fetch', key: 'bar'}, _.to('v', 'r')); },
		function(_) { assert.equal(this.r, 'BAR'); _(); },
		function(_) { stateStore.trans(this.v1, {_type: 'fetch', key: 'baz'}, _.to('v', 'r')); },
		function(_) { assert.equal(this.r, 'BAZ'); _(); },
	    ], done)();
	});
	it('should report a conflict as an error, when one occurs', function(done){
	    util.seq([
		function(_) { stateStore.init('BinTree', {}, _.to('v0')); },
		function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'BAR'}, _.to('v2')); }, // Notice the "foo"
		function(_) { stateStore.merge(this.v1, this.v2, _.to('vm')); },
		function(_) { assert(false, 'Last step should have raised a conflict exception'); _(); },
	    ], function(err) {
		if(!err.conflict) done(err);
		else done();
	    })();
	});
	it('should resolve conflicts if asked to, by prioritizing v1 over v2', function(done){
	    util.seq([
		function(_) { stateStore.init('BinTree', {}, _.to('v0')); },
		function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { stateStore.trans(this.v1, {_type: 'add', key: 'baz', value: 'BAZ'}, _.to('v1')); },
		function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO2'}, _.to('v2')); }, // Note the same key
		function(_) { stateStore.trans(this.v2, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { stateStore.merge(this.v1, this.v2, true, _.to('vm')); },
		function(_) { stateStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('vm', 'r')); },
		function(_) { assert.equal(this.r, 'FOO'); _(); },
		function(_) { stateStore.trans(this.vm, {_type: 'fetch', key: 'bar'}, _.to('vm', 'r')); },
		function(_) { assert.equal(this.r, 'BAR'); _(); },
		function(_) { stateStore.trans(this.vm, {_type: 'fetch', key: 'baz'}, _.to('vm', 'r')); },
		function(_) { assert.equal(this.r, 'BAZ'); _(); },
	    ], done)();
	});
    });
});
