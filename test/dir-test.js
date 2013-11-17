var EvalEnv = require('../evalEnv.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

var evaluators = {
    atom: require('../atom.js'),
    dir: require('../dir.js'),
};

describe('directory', function(){
    var evalEnv;
    var hashDB;
    beforeEach(function() {
	var kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
	evalEnv = new EvalEnv(hashDB, kvs, evaluators);
    });
    describe('create', function(){
	it('should create a child node using the given evaluator type and arguments', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get', _path: ['foo']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
	    ], done)();
	});

    });

});