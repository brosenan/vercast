var assert = require('assert');
var util = require('../util.js');
var DummyAtomicKVS = require('../dummyAtomicKVS.js');
var DummyVersionGraph = require('../dummyVersionGraph.js');
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
    };
    var evalEnv = new EvalEnv(new HashDB(new DummyKVS()), new DummyKVS(), evaluators);
    var branchBase = new BranchBase(evalEnv, tipDB, graphDB);
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
	var compPatch = {_type: 'comp', patches: [
	    {_type: 'create', _path: ['a'], evalType: 'atom', args: {val: 'foo'}},
	    {_type: 'create', _path: ['b'], evalType: 'atom', args: {val: 'bar'}},
	    {_type: 'create', _path: ['c'], evalType: 'atom', args: {val: 'baz'}},
	    {_type: 'set', _path: ['a'], from: 'foo', to: 'bat'},
	]};
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
    });
});
