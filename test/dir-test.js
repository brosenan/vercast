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
    it('should propagate any patches it does not handle itself to child objects', function(done){
	util.seq([
	    function(_) { evalEnv.init('dir', {}, _.to('s0')); },
	    function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
	    function(_) { evalEnv.trans(this.s1, {_type: 'set', _path: ['foo'], from: 'bar', to: 'baz'}, _.to('s2')); },
	    function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _.to('res')); },
	    function(_) { assert.equal(this.res, 'baz'); _(); },
	], done)();
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
    describe('delete', function(){
	it('should remove the object at the given path from the directory', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.trans(this.s1, {_type: 'delete', _path: ['foo']}, _.to('s2')); },
		function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _); },
	    ], function(err) {
		assert(err, 'an error should be emitted');
		assert.equal(err.message, 'Invalid path: foo');
		done();
	    })();
	});

    });

});