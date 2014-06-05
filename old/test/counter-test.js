var EvalEnv = require('../evalEnv.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

var evaluators = {
    counter: require('../counter.js'),
};

describe('counter', function(){
    var evalEnv;
    var hashDB;
    beforeEach(function() {
	var kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
	evalEnv = new EvalEnv(hashDB, kvs, evaluators);
    });
    describe('get', function(){
	it('should initially return 0', function(done){
	    util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'get'}, false, _.to('s1', 'val')); },
		function(_) { hashDB.hash(this.s0, _.to('h0')); },
		function(_) { hashDB.hash(this.s1, _.to('h1')); },
		function(_) {
		    assert.deepEqual(this.h1, this.h0, 'get should not change the state');
		    assert.equal(this.val, 0);
		    _();
		},
	    ], done)();
	});
    });
    describe('add', function(){
	it('should increase the counter value by the given amount', function(done){
	    util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'add', amount: 2}, false, _.to('s1')); },
		function(_) { evalEnv.apply(this.s1, {_type: 'get'}, false, _.to('s2', 'val')); },
		function(_) {
		    assert.equal(this.val, 2);
		    _();
		},
	    ], done)();
	});
	it('should be reversible', function(done){
	    util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'add', amount: 2}, true, _.to('s1')); },
		function(_) { evalEnv.apply(this.s1, {_type: 'get'}, false, _.to('s2', 'res')); },
		function(_) { assert.equal(this.res, -2); _(); },
	    ], done)();
	});

    });


});
