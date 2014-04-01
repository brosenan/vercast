var EvalEnv = require('../evalEnv.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

var evaluators = {
    logicBase: require('../logicBase.js'),
};

describe('logicBase', function(){
    var evalEnv;
    var hashDB;
    beforeEach(function() {
	var kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
	evalEnv = new EvalEnv(hashDB, kvs, evaluators);
    });
    describe('query', function(){
	it('should provide a matching statement, if one exists', function(done){
	    util.seq([
		function(_) { evalEnv.init('logicBase', {}, _.to('state')); },
		function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['a', 1, 2]}, _.to('state')); },
		function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['b', 3, 4]}, _.to('state')); },
		function(_) { evalEnv.query(this.state, {_type: 'query', query: ['a', {v: 0}, {v:1}]}, _.to('res')); },
		function(_) { assert.deepEqual(this.res, [[1, 2]]); _()},
	    ], done)();
	});
    });
});

describe('logicBase Implementation', function(){
    var evalEnv;
    var hashDB;
    beforeEach(function() {
	var kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
	evalEnv = new EvalEnv(hashDB, kvs, evaluators);
    });
    describe('init', function(){
	it('should create a node of the given depth with no value and no children', function(done){
	    util.seq([
		function(_) { evalEnv.init('logicBase', {depth: 7}, _.to('state')); },
		function(_) { hashDB.unhash(this.state, _.to('content')); },
		function(_) { assert.equal(this.content.d, 7);
			      assert(!this.content.v, 'Node should not have a value');
			      assert(!this.content.c, 'Node should not have children'); _();},
	    ], done)();
	});
	it('should set depth to zero if not given', function(done){
	    util.seq([
		function(_) { evalEnv.init('logicBase', {}, _.to('state')); },
		function(_) { hashDB.unhash(this.state, _.to('content')); },
		function(_) { assert.equal(this.content.d, 0); _();},
	    ], done)();
	});
    });
    describe('update', function(){
	describe('assert', function(){
	    it('should add a value to a value-less/child-less node', function(done){
		util.seq([
		    function(_) { evalEnv.init('logicBase', {}, _.to('state')); },
		    function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['a', 1, 2]}, _.to('state')); },
		    function(_) { hashDB.unhash(this.state, _.to('content')); },
		    function(_) { assert.deepEqual(this.content, {_type: 'logicBase', d:0, v:['a', 1, 2]}); _(); },
		], done)();
	    });
	    it('should create a child if a an assertion is made when a value is already given', function(done){
		util.seq([
		    function(_) { evalEnv.init('logicBase', {}, _.to('state')); },
		    function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['a', 1, 2]}, _.to('state')); },
		    function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['b', 3, 4]}, _.to('state')); },
		    function(_) { hashDB.unhash(this.state, _.to('content')); },
		    function(_) { assert.equal(this.content.v, undefined);
				  hashDB.unhash(this.content.c['a/2'], _.to('a')); },
		    function(_) { hashDB.unhash(this.content.c['b/2'], _.to('b')); },
		    function(_) { assert.deepEqual(this.a, {_type: 'logicBase', d:1, v: ['a', 1, 2]});
				  assert.deepEqual(this.b, {_type: 'logicBase', d:1, v: ['b', 3, 4]}); _(); },
		], done)();
	    });
	    it('should index compound terms in the form name/arity', function(done){
		util.seq([
		    function(_) { evalEnv.init('logicBase', {}, _.to('state')); },
		    function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['a', 1, 2]}, _.to('state')); },
		    function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['b', 3, 4, 5]}, _.to('state')); },
		    function(_) { hashDB.unhash(this.state, _.to('content')); },
		    function(_) { assert('a/2' in this.content.c, 'the node should have a key a/2'); _(); },
		    function(_) { assert('b/3' in this.content.c, 'the node should have a key b/3'); _(); },
		], done)();
	    });
	    it('should place two children under a common child if they share the same top-level', function(done){
		util.seq([
		    function(_) { evalEnv.init('logicBase', {}, _.to('state')); },
		    function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['a', 1, 2]}, _.to('state')); },
		    function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['a', 3, 4]}, _.to('state')); },
		    function(_) { hashDB.unhash(this.state, _.to('content')); },
		    function(_) { assert('a/2' in this.content.c, 'the node should have a key a/2'); _(); },
		    function(_) { hashDB.unhash(this.content.c['a/2'], _.to('a')); },
		    function(_) { assert(this.a.c['1'], 'There should be an entry for a(1, 2)');
				  assert(this.a.c['3'], 'There should be an entry for a(3, 4)'); _(); },
		], done)();
	    });
	    it('should allow any number (not limited to 2) of children to a node', function(done){
		util.seq([
		    function(_) { evalEnv.init('logicBase', {}, _.to('state')); },
		    function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['a', 1, 2]}, _.to('state')); },
		    function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['b', 3, 4]}, _.to('state')); },
		    function(_) { evalEnv.trans(this.state, {_type: 'update', assert: ['c', 5, 6]}, _.to('state')); },
		    function(_) { hashDB.unhash(this.state, _.to('content')); },
		    function(_) { hashDB.unhash(this.content.c['a/2'], _.to('a')); },
		    function(_) { hashDB.unhash(this.content.c['b/2'], _.to('b')); },
		    function(_) { hashDB.unhash(this.content.c['c/2'], _.to('c')); },
		    function(_) { assert.deepEqual(this.a, {_type: 'logicBase', d:1, v: ['a', 1, 2]});
				  assert.deepEqual(this.b, {_type: 'logicBase', d:1, v: ['b', 3, 4]});
				  assert.deepEqual(this.c, {_type: 'logicBase', d:1, v: ['c', 5, 6]}); _(); },
		], done)();
	    });

	});
    });
});
