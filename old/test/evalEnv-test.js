var EvalEnv = require('../evalEnv.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

describe('EvalEnv', function(){
    var hashDB;
    var kvs;
    beforeEach(function() {
	kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
    });
    describe('init(evaluator, args, cb(err, h0))', function(){
	it('should return a hash to an object constructed by the evaluator\'s init() method', function(done){
	    var evaluators = {foo: {
		init: function(args, ctx) {
		    ctx.ret({bar: args.bar, baz: 2});
		}
	    }};
	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('foo', {bar: 3}, _.to('h0')); },
		function(_) { assert(this.h0.$hash$, 'h0 must be a hash'); hashDB.unhash(this.h0, _.to('s0')); },
		function(_) { assert.deepEqual(this.s0, {_type: 'foo', bar: 3, baz: 2}); _(); },
	    ], done)();
	});
	it('should pass the evaluator as the "this" of the called method', function(done){
	    var evaluators = {
		foo: {
		    init: function(args, ctx) {
			ctx.ret({val: this.def});
		    },
		    def: 100,
		},
	    };
	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('s0')); },
		function(_) { hashDB.unhash(this.s0, _.to('s0')); },
		function(_) { assert.equal(this.s0.val, 100); _(); },
	    ], done)();
	});
    });
    describe('apply(s1, patch, unapply, cb(err, s2, res, eff, conf))', function(){
	it('should apply patch to s1 by invoking the evaluator\'s apply method, to retrieve s2 and res', function(done){
	    var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:0}); },
		apply: function(s1, patch, unapply, ctx) { assert.equal(patch._type, 'bar');
							   var old = s1.val;
							   s1.val += patch.amount; 
							   ctx.ret(s1, old); },
	    }};
	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.apply(this.h0, {_type: 'bar', amount: 2}, false, _.to('h1', 'res')); },
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.deepEqual(this.s1, {_type: 'foo', val: 2});
			      assert.equal(this.res, 0); _();},
	    ], done)();
	});
	it('should use the patch evaluator if one exists for the patch type', function(done){
	    var evaluators = { 
		foo: {
		    init: function(args, ctx) { ctx.ret({val:0}); },
		    apply: function(s1, patch, unapply, ctx) { var old = s1.val;
							       s1.val += patch.amount; 
							       ctx.ret(s1, old); },
		},
		bar: { 
		    apply: function(s1, patch, unapply, ctx) {
			var old = s1.val;
			s1.val -= patch.amount; // Does the opposite
			ctx.ret(s1, old); 
		    }
		},
	    };
	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.apply(this.h0, {_type: 'bar', amount: 2}, false, _.to('h1', 'res')); },
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.deepEqual(this.s1, {_type: 'foo', val: -2});
			      assert.equal(this.res, 0); _();},
	    ], done)();
	});
	it('should pass the evaluator as the "this" of the called method', function(done){
	    var evaluators = {
		foo: {
		    init: function(args, ctx) {
			ctx.ret({val: 0});
		    },
		    apply: function(s1, patch, unapply, ctx) {
			s1.val += this.amount;
			ctx.ret(s1);
		    },
		    amount: 50,
		},
	    };
	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {}, false, _.to('s1')); },
		function(_) { hashDB.unhash(this.s1, _.to('s1')); },
		function(_) { assert.equal(this.s1.val, 50); _(); },
	    ], done)();
	});
	it('should report a conflict if a propagated patch conflicted', function(done){
	    var evaluators = {
		atom: require('../atom.js'),
		dir: require('../dir.js'),
		comp: require('../composite.js'),
	    };

	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'comp', patches: [
		    {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}},
		    {_type: 'set', _path: ['foo'], from: 'baz', to: 'bat'}, // This is conflicting
		]}, _.to('s1', 'res', 'eff', 'conf')); },
		function(_) { assert(this.conf, 'should be conflicting'); _(); },
	    ], done)();
	});
	it('should collect effect patches from the application of the given patch', function(done){
	    var evaluators = {
		foo: {
		    init: function(args, ctx) {
			ctx.ret({val: 0});
		    },
		    apply: function(s1, patch, unapply, ctx) {
			s1.val += patch.amount * (unapply ? -1 : 1);
			ctx.effect({_type: 'bar', val: s1.val});
			ctx.ret(s1);
		    },
		},
	    };

	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'baz', amount: 10}, false, _.to('s1', 'res', 'eff')); },
		function(_) { assert.deepEqual(this.eff, [{_type: 'bar', val: 10}]); _(); },
	    ], done)();
	});
	it('should accumulate effects of underlying patches', function(done){
	    var evaluators = {
		dir: require('../dir.js'),
		comp: require('../composite.js'),
		foo: {
		    init: function(args, ctx) {
			ctx.ret({val: 0});
		    },
		    apply: function(s1, patch, unapply, ctx) {
			s1.val += patch.amount * (unapply ? -1 : 1);
			ctx.effect({_type: 'bar', val: s1.val});
			ctx.ret(s1);
		    },
		},
	    };

	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'comp', patches: [
		    {_type: 'create', _path: ['a'], evalType: 'foo', args: {}},
		    {_type: 'create', _path: ['b'], evalType: 'foo', args: {}},
		    {_type: 'baz', _path: ['a'], amount: 5},
		    {_type: 'baz', _path: ['b'], amount: 7},
		]}, false, _.to('s1', 'res', 'eff')); },
		function(_) { assert.deepEqual(this.eff, [{_type: 'bar', val: 5}, {_type: 'bar', val: 7}]); _(); },
	    ], done)();
	    
	});

    });
    describe('trans(h1, patch, cb(err, h2, res, eff, conf))', function(){
	it('should apply the patch', function(done){
	    var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:0}); },
		apply: function(s1, patch, unapply, ctx) { var old = s1.val;
							   s1.val += patch.amount; 
							   ctx.ret(s1, old); },
	    }};
	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.trans(this.h0, {_type: 'bar', amount: 2}, _.to('h1', 'res')); },
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.deepEqual(this.s1, {_type: 'foo', val: 2});
			      assert.equal(this.res, 0); _();},
	    ], done)();
	});
	it('should avoid repeating calculations already done', function(done){
	    var count = 0;
	    var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:0}); },
		apply: function(s1, patch, unapply, ctx) { s1.val += patch.amount;
							   count++; // Side effect: count the number of calls
							   ctx.ret(s1); },
	    }};
	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.trans(this.h0, {_type: 'bar', amount: 2}, _.to('h1')); },
		function(_) { evalEnv.trans(this.h1, {_type: 'bar', amount: -2}, _.to('h2')); },
		function(_) { evalEnv.trans(this.h2, {_type: 'bar', amount: 2}, _.to('h3')); },
		function(_) { evalEnv.trans(this.h3, {_type: 'bar', amount: -2}, _.to('h4')); },
		function(_) { evalEnv.trans(this.h4, {_type: 'bar', amount: 2}, _.to('h5')); },
		function(_) { evalEnv.trans(this.h5, {_type: 'bar', amount: -2}, _.to('h6')); },
		function(_) { evalEnv.trans(this.h6, {_type: 'bar', amount: 2}, _.to('h7')); },
		function(_) { evalEnv.trans(this.h7, {_type: 'bar', amount: -2}, _.to('h8')); },
		function(_) { assert.equal(count, 2); _(); },
	    ], done)();
	});
    });
    describe('query(s, q, cb(err, res))', function(){
	it('should apply query patch q to object with state s, emitting res', function(done){
	    var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:args.val}); },
		apply: function(s, query, unapply, ctx) { if(query._type == 'get') { ctx.ret(s, s.val); } },
	    }};
	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('foo', {val:7}, _.to('h0')); },
		function(_) { evalEnv.query(this.h0, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 7); _();},
	    ], done)();
	});
	it('should emit an error if the query changes the state', function(done){
	    var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:0}); },
		apply: function(s1, patch, unapply, ctx) { var old = s1.val;
							   s1.val += patch.amount; 
							   ctx.ret(s1, old); },
	    }};
	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.query(this.h0, {_type: 'bar', amount: 2}, _); },
	    ], function(err) {
		if(!err) {
		    done(new Error('Error not emitted'));
		} else if(err.message == 'Query patch bar changed object state') {
		    done();
		} else {
		    done(err);
		}
	    })();
	});
	it('should do the opposite of applying patch to s1. Applying patch to s2 should result in s1, given that conf is false', function(done){
	    var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:0}); },
		apply: function(s1, patch, unapply, ctx) { 
		    var old = s1.val;
		    if(!unapply) {
			s1.val += patch.amount; 
		    } else {
			s1.val -= patch.amount;
		    }
			ctx.ret(s1, old); 
		},
	    }};
	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    var patch = {_type: 'bar', amount: 2};
	    util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.apply(this.h0, patch, false, _.to('h1')); },
		function(_) { evalEnv.apply(this.h1, patch, true, _.to('h2')); },
		function(_) { hashDB.hash(this.h2, _.to('h2')); },
		function(_) { assert.equal(this.h2.$hash$, this.h0.$hash$); _(); },
	    ], done)();
	});
	it('should use the unpatch evaluator if one exists for the patch type', function(done){
	    var evaluators = { 
		foo: {
		    init: function(args, ctx) { ctx.ret({val:0}); },
		    apply: function(s1, patch, unapply, ctx) { 
			var old = s1.val;
			if(!unapply) {
			    s1.val += patch.amount; 
			} else {
			    s1.val -= patch.amount; 
			}
			ctx.ret(s1, old); 
		    }
		},
		bar: {
		    apply: function(s1, patch, unapply, ctx) { 
			var old = s1.val;
			if(!unapply) {
			    s1.val += patch.amount * 2; 
			} else {
			    s1.val -= patch.amount * 2;
			}
			ctx.ret(s1, old); 
		    }
		},
	    };
	    var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
	    var patch = {_type: 'bar', amount: 2};
	    util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); }, // 0
		function(_) { evalEnv.apply(this.h0, patch, true, _.to('h1')); }, // -4
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.equal(this.s1.val, -4); _(); },
	    ], done)();
	});
    });
});
