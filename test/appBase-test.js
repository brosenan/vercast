var assert = require('assert');
var util = require('../util.js');
var DummyVersionGraph = require('../dummyVersionGraph.js');
var AppBase = require('../appBase.js');
var EvalEnv = require('../evalEnv.js');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

describe('AppBase', function(){
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
    beforeEach(function(done) {
	util.seq([
	    function(_) { graphDB.clear(_); },
	], done)();	
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
		function(_) { evalEnv.init('dir', {}, _.to('state')); },
		function(_) { appBase.trans(this.state, compPatch, {}, _.to('state')); },
		function(_) { evalEnv.query(this.state, {_type: 'get', _path: ['a']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bat'); _(); },
	    ], done)();
	});
	it('should report conflicts', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('state')); },
		function(_) { appBase.trans(this.state, compPatch, {}, _.to('state')); },
		function(_) { appBase.trans(this.state, {_type: 'set', _path: ['a'], from: 'foo', to: 'bar'}, {}, _.to('state', 'conf')); },
		function(_) { assert(this.conf, 'Should conflict'); _(); },
		function(_) { evalEnv.query(this.state, {_type: 'get', _path: ['a']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); }, // The conflicting value
	    ], done)();
	});
	it('should force the change if the strong option is used', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('state')); },
		function(_) { appBase.trans(this.state, compPatch, {}, _.to('state')); },
		function(_) { appBase.trans(this.state, {_type: 'set', _path: ['a'], from: 'foo', to: 'bar'}, {strong: true}, _.to('state')); },
		function(_) { evalEnv.query(this.state, {_type: 'get', _path: ['a']}, _.to('res')); },
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
		function(_) { evalEnv.init('dir', {}, _.to('state')); },
		function(_) { appBase.trans(this.state, compPatch, {}, _.to('state')); },
		function(_) { evalEnv.init('jsMapper', mapper, _.to('mapper')); },
		function(_) { appBase.trans(this.state, {_type: 'add_mapping', _path: ['a'], mapper: this.mapper}, {}, _.to('state')); },
		function(_) { appBase.trans(this.state, {_type: 'set', _path: ['a'], from: 'bat', to: 'bar'}, {}, _.to('state')); },
		function(_) { evalEnv.query(this.state, {_type: 'get', _path: ['bar']}, _.to('a')); },
		function(_) { assert.equal(this.a, 'a'); _(); },
	    ], done)();
	});
    });
    describe('.merge(dest, source, options, cb(err))', function(){
	it('should apply the patches contributing to source to the tip of branch', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('state1')); },
		function(_) { appBase.trans(this.state1, compPatch, {}, _.to('state1')); },
		function(_) { this.state2 = this.state1; _(); },
		function(_) { appBase.trans(this.state1, {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _.to('state1')); },
		function(_) { appBase.trans(this.state2, {_type: 'set', _path: ['c'], from: 'baz', to: 'baz2'}, {}, _.to('state2')); },
		function(_) { appBase.merge(this.state1, this.state2, {}, _.to('state1')); },
		function(_) { evalEnv.query(this.state1, {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.c, 'baz2'); _(); },
		function(_) { evalEnv.query(this.state1, {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { assert.equal(this.b, 'bar2'); _(); },
	    ], done)();
	});
	it('should report conflicts if they occur', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('state1')); },
		function(_) { appBase.trans(this.state1, compPatch, {}, _.to('state1')); },
		function(_) { this.state2 = this.state1; _(); },
		function(_) { appBase.trans(this.state1, {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _.to('state1')); },
		function(_) { appBase.trans(this.state2, {_type: 'set', _path: ['b'], from: 'bar', to: 'bar3'}, {}, _.to('state2')); },
		function(_) { appBase.merge(this.state1, this.state2, {}, _.to('state1', 'conf')); },
		function(_) { assert(this.conf, 'A conflict must be reported'); _(); },
		function(_) { evalEnv.query(this.state1, {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { assert.equal(this.b, 'bar3'); _(); }, // Should take the merged value
	    ], done)();
	});
	it('should accept a "weak" option, by which it would apply only non-conflicting changes', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('state1')); },
		function(_) { appBase.trans(this.state1, compPatch, {}, _.to('state1')); },
		function(_) { this.state2 = this.state1; _(); },
		function(_) { appBase.trans(this.state1, {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _.to('state1')); },
		// Conflicting change
		function(_) { appBase.trans(this.state2, {_type: 'set', _path: ['b'], from: 'bar', to: 'bar3'}, {}, _.to('state2')); },
		// Unconflicting change
		function(_) { appBase.trans(this.state2, {_type: 'set', _path: ['c'], from: 'baz', to: 'baz3'}, {}, _.to('state2')); },
		function(_) { appBase.merge(this.state1, this.state2, {weak: true}, _.to('state1', 'conf')); },
		function(_) { assert(!this.conf, 'A conflict should not be reported'); _(); },
		function(_) { evalEnv.query(this.state1, {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.c, 'baz3'); _(); },
		function(_) { evalEnv.query(this.state1, {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { assert.equal(this.b, 'bar2'); _(); }, // The value on the destination branch
	    ], done)();
	});
	it('should apply a back-merge correctly', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('state1')); },
		function(_) { appBase.trans(this.state1, compPatch, {}, _.to('state1')); },
		function(_) { this.state2 = this.state1; _(); },
		function(_) { appBase.trans(this.state1, {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _.to('state1')); },
		function(_) { appBase.trans(this.state2, {_type: 'set', _path: ['c'], from: 'baz', to: 'baz2'}, {}, _.to('state2')); },
		function(_) { appBase.merge(this.state1, this.state2, {}, _.to('state1')); },
		function(_) { appBase.merge(this.state2, this.state1, {}, _.to('state2')); }, // merge back
		// Check that br1 got the data from br2
		function(_) { evalEnv.query(this.state1, {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.c, 'baz2'); _(); },
		// Check that br2 got the data from br1
		function(_) { evalEnv.query(this.state2, {_type: 'get', _path: ['b']}, _.to('b')); },
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
