var assert = require('assert');
var util = require('../util.js');
var DummyAtomicKVS = require('../dummyAtomicKVS.js');
var DummyVersionGraph = require('../dummyVersionGraph.js');
var AppBase = require('../appBase.js');
var BranchBase = require('../branchBase.js');
var EvalEnv = require('../evalEnv.js');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

describe('BranchBase', function(){
    var tipDB = new DummyAtomicKVS();
    var graphDB = new DummyVersionGraph();
    var evaluators = {
	comp: require('../composite.js'),
	inv: require('../inv.js'),
	atom: require('../atom.js'),
	dir: require('../dir.js'),
	counter: require('../counter.js'),
	jsMapper: require('../jsMapper.js'),
    };
    var evalEnv = new EvalEnv(new HashDB(new DummyKVS()), new DummyKVS(), evaluators);
    var appBase = new AppBase(evalEnv, graphDB);
    var branchBase = new BranchBase(appBase, tipDB);
    beforeEach(function(done) {
	util.seq([
	    function(_) { tipDB.clear(_); },
	    function(_) { graphDB.clear(_); },
	], done)();	
    });

    describe('.newBranch(branchName, s0, cb(err))', function(){
	it('should create a new branch with the given branchName, with the initial state s0', function(done){
	    util.seq([
		function(_) { evalEnv.init('atom', {val: 'bar'}, _.to('s0')); },
		function(_) { branchBase.newBranch('foo', this.s0, _);  },
		function(_) { branchBase.query('foo', {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
	    ], done)();
	});
    });

    describe('.query(branchName, state, cb(err, res))', function(){
	
    });
    describe('.init(branchName, evaluator, args, cb(err))', function(){
	it('should create a new branch with the given evaluator and arguments', function(done){
	    util.seq([
		function(_) { branchBase.init('foo', 'atom', {val: 'bar'}, _); },
		function(_) { branchBase.query('foo', {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
	    ], done)();

	});

    });

    var compPatch = {_type: 'comp', patches: [
	{_type: 'create', _path: ['a'], evalType: 'atom', args: {val: 'foo'}},
	{_type: 'create', _path: ['b'], evalType: 'atom', args: {val: 'bar'}},
	{_type: 'create', _path: ['c'], evalType: 'atom', args: {val: 'baz'}},
	{_type: 'set', _path: ['a'], from: 'foo', to: 'bat'},
    ]};
    describe('.trans(branch, patch, options, cb(err))', function(){
	it('should apply the given patch on the tip of the given branch', function(done){
	    var compPatch = {_type: 'comp', patches: [
		{_type: 'create', _path: ['a'], evalType: 'atom', args: {val: 'foo'}},
		{_type: 'create', _path: ['b'], evalType: 'atom', args: {val: 'bar'}},
		{_type: 'create', _path: ['c'], evalType: 'atom', args: {val: 'baz'}},
		{_type: 'set', _path: ['a'], from: 'foo', to: 'bat'},
	    ]};
	    util.seq([
		function(_) { branchBase.init('br', 'dir', {}, _); },
		function(_) { branchBase.trans('br', compPatch, {}, _); },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['a']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bat'); _(); },
	    ], done)();
	});
	it('should retry and reapply the patch over the new tip if the tip moves during the transition', function(done){
	    util.seq([
		function(_) { branchBase.init('br', 'dir', {}, _); },
		function(_) { branchBase.trans('br', compPatch, {}, _); },
		function(_) { tipDB.retrieve('br', _.to('tip')); },
		function(_) { evalEnv.trans(this.tip, {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, _.to('s1')); },
		function(_) { var p = util.parallel(2, _);
			      branchBase.trans('br', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz2'}, {}, p);
			      tipDB.modify('br', this.tip, this.s1, p); // This will be done before the transition on c completes
			    },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.b, 'bar2'); // Both changes apply
			      assert.equal(this.c, 'baz2'); _(); },
	    ], done)();
	});
	it('should retry the given number of times', function(done){
	    util.seq([
		function(_) { branchBase.init('br', 'dir', {}, _); },
		function(_) { branchBase.trans('br', compPatch, {}, _); },
		function(_) { tipDB.retrieve('br', _.to('tip')); },
		function(_) { evalEnv.trans(this.tip, {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, _.to('s1')); },
		function(_) { var p = util.parallel(2, _);
			      branchBase.trans('br', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz2'}, {retries: 1}, p);
			      tipDB.modify('br', this.tip, this.s1, p); // This will be done before the transition on c completes
			    },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.b, 'bar2'); // Both changes apply
			      assert.equal(this.c, 'baz2'); _(); },
	    ], function(err) {
		assert(err, 'An error needs to be emitted');
		done(err.message == 'Retries exhasted trying to modify state of branch br' ? undefined : err);
	    })();
	});
	it('should emit an error by default if the patch conflicts', function(done){
	    util.seq([
		function(_) { branchBase.init('br', 'dir', {}, _); },
		function(_) { branchBase.trans('br', compPatch, {}, _); },
		function(_) { branchBase.trans('br', {_type: 'set', _path: ['a'], from: 'foo', to: 'bar'}, {}, _); },
	    ], function(err) {
		assert(err, 'There should be an error');
		done(err.message == 'Conflicting change in transition on branch br' ? undefined : err);
	    })();
	});
	it('should force the change if the strong option is used', function(done){
	    util.seq([
		function(_) { branchBase.init('br', 'dir', {}, _); },
		function(_) { branchBase.trans('br', compPatch, {}, _); },
		function(_) { branchBase.trans('br', {_type: 'set', _path: ['a'], from: 'foo', to: 'bar'}, {strong: true}, _); },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['a']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
	    ], done)();
	});
	it('should apply effect patches as part of the transition', function(done){
	    var mapper = fun2str({
		map_set: function(patch) {
		    emit({_type: 'create', 
			  _path: [patch.to], 
			  evalType: 'atom', 
			  args: {val: patch._at_path[0]}});
		},
	    });
	    util.seq([
		function(_) { branchBase.init('br', 'dir', {}, _); },
		function(_) { branchBase.trans('br', compPatch, {}, _); },
		function(_) { evalEnv.init('jsMapper', mapper, _.to('mapper')); },
		function(_) { branchBase.trans('br', {_type: 'add_mapping', _path: ['a'], mapper: this.mapper}, {}, _); },
		function(_) { branchBase.trans('br', {_type: 'set', _path: ['a'], from: 'bat', to: 'bar'}, {}, _); },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['bar']}, _.to('a')); },
		function(_) { assert.equal(this.a, 'a'); _(); },
	    ], done)();
	});
    });
    describe('.merge(dest, source, options, cb(err))', function(){
	it('should apply the patches contributing to source to the tip of branch', function(done){
	    util.seq([
		function(_) { branchBase.init('br1', 'dir', {}, _); },
		function(_) { branchBase.trans('br1', compPatch, {}, _); },
		function(_) { branchBase.fork('br1', 'br2', _); },
		function(_) { branchBase.trans('br1', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz2'}, {}, _); },
		function(_) { branchBase.merge('br1', 'br2', {}, _); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.c, 'baz2'); _(); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { assert.equal(this.b, 'bar2'); _(); },
	    ], done)();
	});
	it('should emit an error by default if a merge conflict is found', function(done){
	    util.seq([
		function(_) { branchBase.init('br1', 'dir', {}, _); },
		function(_) { branchBase.trans('br1', compPatch, {}, _); },
		function(_) { branchBase.fork('br1', 'br2', _); },
		function(_) { branchBase.trans('br1', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar3'}, {}, _); },
		function(_) { branchBase.merge('br1', 'br2', {}, _); },
	    ], function(err) {
		assert(err, 'An error must be emitted');
		done(err.message == 'Conflicting change in transition on branch br1' ? undefined : err);
	    })();
	});
	it('should accept a "weak" option, by which it would apply only non-conflicting changes', function(done){
	    util.seq([
		function(_) { branchBase.init('br1', 'dir', {}, _); },
		function(_) { branchBase.trans('br1', compPatch, {}, _); },
		function(_) { branchBase.fork('br1', 'br2', _); },
		function(_) { branchBase.trans('br1', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['b'], from: 'bar', to: 'baz3'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz3'}, {}, _); },
		function(_) { branchBase.merge('br1', 'br2', {weak: true}, _); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.c, 'baz3'); _(); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { assert.equal(this.b, 'bar2'); _(); }, // The value on the destination branch
	    ], done)();
	});
	it('should accept a "strong" option, by which it will force the change in case of a conflict', function(done){
	    util.seq([
		function(_) { branchBase.init('br1', 'dir', {}, _); },
		function(_) { branchBase.trans('br1', compPatch, {}, _); },
		function(_) { branchBase.fork('br1', 'br2', _); },
		function(_) { branchBase.trans('br1', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar3'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz3'}, {}, _); },
		function(_) { branchBase.merge('br1', 'br2', {strong: true}, _); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.c, 'baz3'); _(); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { assert.equal(this.b, 'bar3'); _(); }, // The value on the source branch
	    ], done)();
	});
	it('should apply a back-merge correctly', function(done){
	    util.seq([
		function(_) { branchBase.init('br1', 'dir', {}, _); },
		function(_) { branchBase.trans('br1', compPatch, {}, _); },
		function(_) { branchBase.fork('br1', 'br2', _); },
		function(_) { branchBase.trans('br1', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz2'}, {}, _); },
		function(_) { branchBase.merge('br1', 'br2', {}, _); },
		function(_) { branchBase.merge('br2', 'br1', {}, _); }, // merge back
		// Check that br1 got the data from br2
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.c, 'baz2'); _(); },
		// Check that br2 got the data from br1
		function(_) { branchBase.query('br2', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { assert.equal(this.b, 'bar2'); _(); },
	    ], done)();
	});
    });
    function fun2str(obj) {
	var ret = {};
	for(var key in obj) {
	    if(typeof obj[key] == 'function') {
		ret[key] = obj[key].toString();
	    } else {
		ret[key] = obj[key];
	    }
	}
	return ret;
    }
});
