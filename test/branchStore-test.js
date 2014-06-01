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

var branchStore = createBranchStore({
    BinTree: require('../binTree.js'),
    ':transaction': require('../transaction.js'),
    ':inv': require('../inv.js'),
});

describe('BranchStore', function(){
    afterEach(function() { 
	graphDB.abolish();
	atomicStore.abolish(); 
    });
    describe('.init(className, args, cb(err, v0))', function(){});
    describe('.trans(v1, p, cb(err, v2, r, c))', function(){
	it('should accept a transaction object in place of v1, and update it', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
		function(_) { this.t = branchStore.beginTransaction(this.v0);
			      branchStore.trans(this.t, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1'));},
		function(_) { branchStore.trans(this.t, {_type: 'fetch', key: 'foo'}, _.to('v1', 'r')); },
		function(_) { assert.equal(this.r, 'FOO'); 
			      assert.equal(this.t.curr.$, this.v1.$); _(); },
	    ], done)();
	});
	it('should not record transitions based on transactions in the version graph', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
		function(_) { this.t = branchStore.beginTransaction(this.v0);
			      branchStore.trans(this.t, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { branchStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { branchStore.pull(this.v1, this.v2, _.to('vm')); },
		function(_) { assert(false, 'Pull should throw an exception'); _(); },
	    ], function(err) {
		var prefix = 'No path found from'
		if(err.message.substr(0, prefix.length) == prefix) done();
		else done(err);
	    })();
	});

    });
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
	it('should merge between the given version and the given branch (if so given)', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v')); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { branchStore.fork('b1', this.v1, _); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { branchStore.pull(this.v2, 'b1', _.to('vm')); },
		function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('v3', 'r')); },
		function(_) { assert.equal(this.r, 'FOO'); _(); },
		function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'bar'}, _.to('v3', 'r')); },
		function(_) { assert.equal(this.r, 'BAR'); _(); },
	    ], done)();
	});
	it('should resolve conflicts, should they occur, by preferring the second argument', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v')); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { branchStore.trans(this.v1, {_type: 'add', key: 'bar', value: 'BARFOOD'}, _.to('v1')); },
		function(_) { branchStore.fork('b1', this.v1, _); },
		function(_) { branchStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { branchStore.pull(this.v2, 'b1', _.to('vm')); },
		function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('v3', 'r')); },
		function(_) { assert.equal(this.r, 'FOO'); _(); },
		function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'bar'}, _.to('v3', 'r')); },
		function(_) { assert.equal(this.r, 'BARFOOD'); _(); },
	    ], done)();
	});
    });
    describe('.beginTransaction(v0)', function(){
	it('should return a transaction object for which both baseline version and current version are v0', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
		function(_) { var trans = branchStore.beginTransaction(this.v0); 
			      assert.equal(trans.baseline.$, this.v0.$);
			      assert.equal(trans.curr.$, this.v0.$);
			      _();
			    },
	    ], done)();
	});
    });
    describe('.commit(tranaction, cb(err, v))', function(){
	it('should record the transaction in the version graph', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
		function(_) { this.t = branchStore.beginTransaction(this.v0);
			      branchStore.trans(this.t, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { branchStore.trans(this.t, {_type: 'add', key: 'foo2', value: 'FOO2'}, _.to('v1')); },
		function(_) { branchStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { branchStore.commit(this.t, _); },
		function(_) { branchStore.pull(this.v1, this.v2, _.to('vm')); },
		function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('vm', 'r')); },
		function(_) { assert.equal(this.r, 'FOO'); _(); },
	    ], done)();
	});
	it('should keep transactions together when conflicts occur', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
		function(_) { this.t = branchStore.beginTransaction(this.v0);
			      branchStore.trans(this.t, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { branchStore.trans(this.t, {_type: 'add', key: 'foo2', value: 'FOO2'}, _.to('v1')); },
		function(_) { branchStore.commit(this.t, _); },
		function(_) { branchStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { branchStore.trans(this.v2, {_type: 'add', key: 'foo', value: 'FOO3'}, _.to('v2')); }, // conflicting with our transaction
		function(_) { branchStore.pull(this.v1, this.v2, _.to('vm')); },
		function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('vm', 'r')); },
		function(_) { assert.equal(this.r, 'FOO3'); _(); }, // v2 wins
		function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo2'}, _.to('vm', 'r')); },
		function(_) { assert.equal(typeof this.r, 'undefined'); _(); }, // even the non-conflicting changes in the transaction are rolled back
	    ], done)();
	});
	it('should record losing transactions such that they are canceled', function(done){
	    util.seq([
		function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
		function(_) { this.t = branchStore.beginTransaction(this.v0);
			      branchStore.trans(this.t, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
		function(_) { branchStore.trans(this.t, {_type: 'add', key: 'foo2', value: 'FOO2'}, _.to('v1')); },
		function(_) { branchStore.commit(this.t, _); },
		function(_) { branchStore.trans(this.v1, {_type: 'add', key: 'otherThing', value: 4}, _.to('v1')); },
		function(_) { branchStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
		function(_) { branchStore.trans(this.v2, {_type: 'add', key: 'foo', value: 'FOO3'}, _.to('v2')); },
		function(_) { branchStore.pull(this.v1, this.v2, _.to('vm')); },
		function(_) { branchStore.trans(this.v1, {_type: 'add', key: 'somethingElse', value: 3}, _.to('v3')); },
		function(_) { branchStore.pull(this.vm, this.v3, _.to('vm2')); }, // v3, that contains the transaction, should win
		function(_) { branchStore.trans(this.vm2, {_type: 'fetch', key: 'foo'}, _.to('vm2', 'r')); },
		function(_) { assert.equal(this.r, 'FOO3'); _(); }, // but vm won
		function(_) { branchStore.trans(this.vm2, {_type: 'fetch', key: 'foo2'}, _.to('vm2', 'r')); },
		function(_) { assert.equal(typeof this.r, 'undefined'); _(); }, // the transaction is still canceled.
	    ], done)();
	});

    });
});
