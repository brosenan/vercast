var EvalEnv = require('../evalEnv.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

var evaluators = {
    atom: require('../atom.js'),
    dir: require('../dir.js'),
    inv: require('../inv.js'),
    coll: require('../collection.js'),
};

describe('collection', function(){
    var evalEnv;
    var hashDB;
    beforeEach(function() {
	var kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
	evalEnv = new EvalEnv(hashDB, kvs, evaluators);
    });
    
    describe('init', function(){
	it('should create an empty collection', function(done){
	    util.seq([
		function(_) { evalEnv.init('coll', {}, _.to('s0')); },
		function(_) { evalEnv.query(this.s0, {_type: 'get'}, _.to('res')); },
		function(_) { assert.deepEqual(this.res, {}); _(); },
	    ], done)();
	});
    });
    describe('add', function(){
	it('should add a key/value pair to the collection', function(done){
	    util.seq([
		function(_) { evalEnv.init('coll', {}, _.to('state')); },
		function(_) { evalEnv.trans(this.state, {_type: 'add', key: 'foo', val: 'bar'}, _.to('state')); },
		function(_) { evalEnv.query(this.state, {_type: 'get'}, _.to('res')); },
		function(_) { assert.deepEqual(this.res, {foo: 'bar'}); _(); },
	    ], done)();

	});

    });

});
