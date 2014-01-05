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


});
