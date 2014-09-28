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
		map: function(patch) {
		    process.__foo__ = patch;
		},
	    });
	    util.seq([
		function(_) { evalEnv.init('jsMapper', mapper, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'foo', bar: 'baz'}, _); },
		function(_) { assert.deepEqual(process.__foo__, {_type: 'foo', bar: 'baz'}); _(); },
	    ], done)();
	});
	it('should pass the state as the map function\'s "this" argument', function(done){
	    process.__foo__ = 'bar';
	    var mapper = fun2str({
		map: function(patch) {
		    process.__foo__ = this.foo;
		},
		foo: 'baz',
	    });
	    util.seq([
		function(_) { evalEnv.init('jsMapper', mapper, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'foo', bar: 'baz'}, _); },
		function(_) { assert.equal(process.__foo__, 'baz'); _(); },
	    ], done)();	    
	});
	it('should interpret invocations of the "emit" function as effect', function(done){
	    var mapper = fun2str({
		map: function(patch) {
		    emit({_type: 'bar', baz: 'bat'});
		},
	    });
	    util.seq([
		function(_) { evalEnv.init('jsMapper', mapper, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'foo', bar: 'baz'}, _.to('s1', 'res', 'eff')); },
		function(_) { assert.deepEqual(this.eff, [{_type: 'bar', baz: 'bat'}]); _(); },
	    ], done)();
	});
	it('should invoke unmap() when unapplied', function(done){
	    var mapper = fun2str({
		map: function(patch) {
		    throw new Error('map() should not be called');
		},
		unmap: function(patch) {
		    emit({foo: 'bar'});
		},
	    });
	    util.seq([
		function(_) { evalEnv.init('jsMapper', mapper, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'inv', patch: {_type: 'foo', bar: 'baz'}}, _.to('s1', 'res', 'eff')); },
		function(_) { assert.deepEqual(this.eff, [{foo: 'bar'}]); _(); },
	    ], done)();
	});
	it('should call a method named map_foo() for patch where _type="foo", if such a method exists', function(done){
	    var mapper = fun2str({
		map: function(patch) {
		    throw new Error('map() should not be called');
		},
		map_foo: function(patch) {
		    emit({foo: 'bar1'});
		    emit({foo: 'bar2'});
		},
	    });
	    util.seq([
		function(_) { evalEnv.init('jsMapper', mapper, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'foo', bar: 'baz'}, _.to('s1', 'res', 'eff')); },
		function(_) { assert.deepEqual(this.eff, [{foo: 'bar1'}, {foo: 'bar2'}]); _(); },
	    ], done)();
	});
    });
});