var EvalEnv = require('../evalEnv.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

var evaluators = {
    atom: require('../atom.js'),
};

describe('atom', function(){
    var evalEnv;
    var hashDB;
    beforeEach(function() {
	var kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
	evalEnv = new EvalEnv(hashDB, kvs, evaluators);
    });
    describe('get', function(){
	it('should return the atom\'s value', function(done){
	    util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.query(this.s0, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'foo'); _(); },
	    ], done)();
	});
	it('should return the last set value even at the event of a conflict', function(done){
	    util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'set', from: 'foo', to: 'bar'}, _.to('s1')); },
		function(_) { evalEnv.trans(this.s1, {_type: 'set', from: 'foo', to: 'baz'}, _.to('s2')); },
		function(_) { evalEnv.query(this.s2, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'baz'); _(); },
	    ], done)();
	});

    });
    describe('set', function(){
	it('should change the state to contain the "to" value, given that the "from" value matches the current state', function(done){
	    util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'set', from: 'foo', to: 'bar'}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
	    ], done)();
	});
	it('should report a conflict if the "from" value does not match', function(done){
	    util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'set', from: 'bar', to: 'baz'}, _.to('s1', 'res', 'eff', 'conf')); },
		function(_) { assert(this.conf, 'A conflict should be reported'); _(); },
	    ], done)();
	});
    });
    describe('get_all', function(){
	it('should return all possible values', function(done){
	    util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'set', from: 'foo', to: 'bar'}, _.to('s1')); },
		function(_) { evalEnv.trans(this.s1, {_type: 'set', from: 'foo', to: 'baz'}, _.to('s2')); },
		function(_) { evalEnv.query(this.s2, {_type: 'get_all'}, _.to('res')); },
		function(_) { assert.deepEqual(this.res, ['baz', 'bar']); _(); },
	    ], done)();
	});

    });

});
