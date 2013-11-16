var EvalEnv = require('../evalEnv.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

var evaluators = {
    counter: require('../counter.js'),
    inv: require('../inv.js'),
};

describe('inverse patch', function(){
    var hashDB;
    var kvs;
    var evalEnv;
    beforeEach(function() {
	kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
	evalEnv = new EvalEnv(hashDB, kvs, evaluators);
    });
    describe('patch', function(){
	it('should unapply the underlying patch', function(done){
	    util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'inv', patch: {_type: 'add', amount: 2}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, -2); _(); },
	    ], done)();
	});
    });
    describe('unpatch', function(){
	it('should apply the undelying patch', function(done){
	    util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.unapply(this.s0, {_type: 'inv', patch: {_type: 'add', amount: 2}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 2); _(); },
	    ], done)();
	});
    });
});