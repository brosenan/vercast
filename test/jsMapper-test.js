var EvalEnv = require('../evalEnv.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

var evaluators = {
    atom: require('../atom.js'),
    dir: require('../dir.js'),
    inv: require('../inv.js'),
    comp: require('../composite.js'),
    jsMapper: require('../jsMapper.js'),
};

describe('jsMapper', function(){
    var evalEnv;
    var hashDB;
    beforeEach(function() {
	var kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
	evalEnv = new EvalEnv(hashDB, kvs, evaluators);
    });
    describe('init', function(){
	it('should take the args as state', function(done){
	    util.seq([
		function(_) { evalEnv.init('jsMapper', {foo: 'bar'}, _.to('s0')); },
		function(_) { hashDB.unhash(this.s0, _.to('s0')); },
		function(_) { assert.deepEqual(this.s0, {_type: 'jsMapper', foo: 'bar'}); _(); },
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

    describe('map', function(){
	it('should invoke the map() function defined in the state, with the patch as parameter when applied', function(done){
	    process.__foo__ = 'bar';
	    var mapper = fun2str({
		map: function(patch, ctx) {
		    process.__foo__ = patch;
		},
	    });
	    util.seq([
		function(_) { evalEnv.init('jsMapper', mapper, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'foo', bar: 'baz'}, _); },
		function(_) { assert.deepEqual(process.__foo__, {_type: 'foo', bar: 'baz'}); _(); },
	    ], done)();

	});

    });

});