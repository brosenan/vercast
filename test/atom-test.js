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
    describe('init', function(){
	it('should create an atom with the given value', function(done){
	    util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { hashDB.unhash(this.s0, _.to('s0')); },
		function(_) { assert.deepEqual(this.s0, {_type: 'atom', val: 'foo'}); _(); },
	    ], done)();
	});
    });
    describe('set', function(){
	it('should change the state to contain the "to" value, given that the "from" value matches the current state', function(done){
	    util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'set', from: 'foo', to: 'bar'}, _.to('s1')); },
		function(_) { hashDB.unhash(this.s1, _.to('s1')); },
		function(_) { assert.deepEqual(this.s1, {_type: 'atom', val: 'bar'}); _(); },
	    ], done)();
	});

    });

});