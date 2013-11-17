var EvalEnv = require('../evalEnv.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

var evaluators = {
    counter: require('../counter.js'),
    comp: require('../composite.js'),
    inv: require('../inv.js'),
    dir: require('../dir.js'),
    atom: require('../atom.js'),
};

describe('composite patch', function(){
    var hashDB;
    var kvs;
    var evalEnv;
    beforeEach(function() {
	kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
	evalEnv = new EvalEnv(hashDB, kvs, evaluators);
    });
    describe('apply', function(){
	it('should apply the given patches one by one', function(done){
	    util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'comp', patches: [
		    {_type: 'add', amount: 2},
		    {_type: 'add', amount: 2},
		    {_type: 'add', amount: 2},
		    {_type: 'add', amount: 2},
		]}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 8); _(); },
	    ], done)();
	});
	it('should return an array of the underlying results', function(done){
	    util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'comp', patches: [
		    {_type: 'add', amount: 2},
		    {_type: 'get'},
		    {_type: 'add', amount: 2},
		    {_type: 'get'},
		]}, _.to('s1', 'res')); },
		function(_) { assert.deepEqual(this.res, [undefined, 2, undefined, 4]); _(); },
	    ], done)();
	});
	describe('weak', function(){
	    it('should not apply conflicting patches', function(done){
		util.seq([
		    function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		    function(_) { evalEnv.trans(this.s0, {_type: 'comp', weak: true, patches: [
			{_type: 'set', from: 'foo', to: 'bar'},
			{_type: 'set', from: 'foo', to: 'baz'},
		    ]}, _.to('s1')); },
		    function(_) { evalEnv.query(this.s1, {_type: 'get_all'}, _.to('res')); },
		    // Only the non-conflicting change should be performed
		    function(_) { assert.deepEqual(this.res, ['bar']); _(); },
		], done)();
	    });
	    it('should report the conflicting patch in the results', function(done){
		util.seq([
		    function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		    function(_) { evalEnv.trans(this.s0, {_type: 'comp', weak: true, patches: [
			{_type: 'set', from: 'foo', to: 'bar'},
			{_type: 'set', from: 'foo', to: 'baz'},
		    ]}, _.to('s1', 'res')); },
		    function(_) { assert.deepEqual(this.res, [undefined, 
							      {$badPatch: 
							       {_type: 'set', 
								from: 'foo', 
								to: 'baz'}}]); _(); },
		], done)();
	    });

	});
    });
    describe('unapply', function(){
	it('should unapply the given patches in reverse order', function(done){
	    util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.unapply(this.s0, {_type: 'comp', patches: [
		    {_type: 'add', amount: 2},
		    {_type: 'get'},
		    {_type: 'add', amount: 3},
		    {_type: 'get'},
		]}, _.to('s1', 'res')); },
		function(_) { assert.deepEqual(this.res, [0, undefined, -3, undefined]); _(); },
	    ], done)();
	});
    });
});
