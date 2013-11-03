var VCObj = require('../vcobj.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

describe('VCObj', function(){
    describe('createObject(cls, s0, cb(err, h0))', function(){
	it('should create an object state hash for the given class and initial state', function(done){
	    var hashDB = new HashDB(new DummyKVS());
	    var obj = new VCObj(hashDB);
	    var cls = { foo: function() { console.log("bar"); }, 
			bar: function() { console.log("baz"); } };
	    util.seq([
		function(_) { obj.createObject(cls, {val:0}, _.to('h0')); },
		function(_) { hashDB.unhash(this.h0, _.to('s0')); },
		function(_) { assert.equal(this.s0.val, 0);
			      hashDB.unhash(this.s0._class, _.to('cls'));},
		function(_) { assert.equal(this.cls.foo, 'function () { console.log("bar"); }'); _(); },
	    ], done)();
	});
    });
    describe('apply(h1, patch, cb(err, h2, res, effect, conflict))', function(){
	it('should apply a patch to the given state, activating a class method', function(done){
	    var rand = Math.random();
	    var cls = {
		foo: function(p, ctx) { process._beenThere = p.rand; ctx.ret(); }
	    };
	    var obj = new VCObj(new HashDB(new DummyKVS()));
	    util.seq([
		function(_) { obj.createObject(cls, {}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo', rand: rand}, _); },
		function(_) { assert.equal(process._beenThere, rand); _(); },
	    ], done)();
	});
	it('should emit the new state hash, and the result emitted by the invoked method', function(done){
	    var cls = {
		foo: function(p, ctx) { ctx.ret('result'); }
	    };
	    var obj = new VCObj(new HashDB(new DummyKVS()));
	    util.seq([
		function(_) { obj.createObject(cls, {}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1', 'res', 'effect', 'conflict')); },
		function(_) { assert.deepEqual(this.h1, this.h0);
			      assert.equal(this.res, 'result'); _();},
	    ], done)();
	});
	it('should pass the invoked method the state as its this parameter', function(done){
	    var cls = {
		foo: function(p, ctx) { ctx.ret(this.baz); }
	    };
	    var obj = new VCObj(new HashDB(new DummyKVS()));
	    util.seq([
		function(_) { obj.createObject(cls, {baz: 'bat'}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1', 'res')); },
		function(_) { assert.deepEqual(this.h1, this.h0);
			      assert.equal(this.res, 'bat'); _();},
	    ], done)();
	});
	it('should emit the new state based on the content of "this" when the method returns', function(done){
	    var cls = {
		foo: function(p, ctx) { this.bar = 'baz'; ctx.ret(); }
	    };
	    var hashDB = new HashDB(new DummyKVS());
	    var obj = new VCObj(hashDB);
	    util.seq([
		function(_) { obj.createObject(cls, {}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1')); },
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.equal(this.s1.bar, 'baz'); _();},
	    ], done)();
	});

	it('should allow objects to further call other objects by sending them patches', function(done){
	    var cls1 = {
		foo: function(p, ctx) {
		    var state = this;
		    util.seq([
			function(_) { ctx.apply(state.child, {type: 'bar', val: 2}, _.to('child', 'res')); },
			function(_) { ctx.ret(this.res); },
		    ], ctx.done)();
		}
	    };
	    var cls2 = {
		bar: function(p, ctx) {
		    var state = this;
		    state.val = p.val;
		    ctx.ret(p.val + 1);
		}
	    }
	    var obj = new VCObj(new HashDB(new DummyKVS()));
	    util.seq([
		function(_) { obj.createObject(cls2, {}, _.to('child')); },
		function(_) { obj.createObject(cls1, {child: this.child}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1', 'res')); },
		function(_) { assert.equal(this.res, 3); _(); },
	    ], done)();
	});
	it('should report conflict if the context conflict() method was called', function(done){
	    var cls = {
		foo: function(p, ctx) { ctx.conflict(); ctx.ret(); }
	    };
	    var hashDB = new HashDB(new DummyKVS());
	    var obj = new VCObj(hashDB);
	    util.seq([
		function(_) { obj.createObject(cls, {}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1', 'res', 'effect', 'conflict')); },
		function(_) { assert(this.conflict, 'The conflict flag should be true'); _();},
	    ], done)();
	});
	it('should propagate conflicts reported in child objects', function(done){
	    var cls1 = {
		foo: function(p, ctx) {
		    var state = this;
		    util.seq([
			function(_) { ctx.apply(state.child, {type: 'bar', val: 2}, _.to('child', 'res')); },
			function(_) { ctx.ret(this.res); },
		    ], ctx.done)();
		}
	    };
	    var cls2 = {
		bar: function(p, ctx) {
		    var state = this;
		    state.val = p.val;
		    ctx.conflict(); // The child conflicts
		    ctx.ret(p.val + 1);
		}
	    }
	    var obj = new VCObj(new HashDB(new DummyKVS()));
	    util.seq([
		function(_) { obj.createObject(cls2, {}, _.to('child')); },
		function(_) { obj.createObject(cls1, {child: this.child}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1', 'res', 'effect', 'conflict')); },
		function(_) { assert(this.conflict, 'the conflict flag should be true'); _(); },
	    ], done)();
	});
	it('should accept patches that have a "code" field instead of "type"', function(done){
	    var code = function(patch, ctx) {
		this.val += patch.amount;
		ctx.ret();
	    }
	    var hashDB = new HashDB(new DummyKVS());
	    var obj = new VCObj(hashDB);
	    util.seq([
		function(_) { hashDB.hash(code.toString(), _.to('code')); },
		function(_) { obj.createObject({}, {val:0}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {code: this.code, amount: 3}, _.to('h1')); },
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.equal(this.s1.val, 3); _(); },
	    ], done)();
	});
    });
    describe('invert(patch, cb(err, invPatch))', function(){
	it('should invert any patch that has an inv field specifying its inversion logic', function(done){
	    var inv = function(patch) {
		patch.amount = -patch.amount;
		return patch;
	    }
	    var hashDB = new HashDB(new DummyKVS());
	    var obj = new VCObj(hashDB);
	    util.seq([
		function(_) { hashDB.hash(inv.toString(), _.to('invHash')); },
		function(_) { obj.invert({type: 'add', amount: 2, inv: this.invHash}, _.to('inv')); },
		function(_) { assert.deepEqual(this.inv, {type: 'add', amount: -2, inv: this.invHash}); _(); },
	    ], done)();
	});
	it('should return the patch unchanged in case an inv field does not exist', function(done){
	    var hashDB = new HashDB(new DummyKVS());
	    var obj = new VCObj(hashDB);
	    util.seq([
		function(_) { obj.invert({type: 'add', amount: 2}, _.to('inv')); },
		function(_) { assert.deepEqual(this.inv, {type: 'add', amount: 2}); _(); },
	    ], done)();
	});
    });
    describe('createChainPatch(patches, cb(err, patch))', function(){
	it('should create a patch that applies all given patches one by one', function(done){
	    function createCounter(obj, hashDB, cb) {
		var cls = {
		    add: function(patch, ctx) {
			this.val += patch.amount;
			ctx.ret();
		    },
		    get: function(patch, ctx) {
			ctx.ret(this.val);
		    },
		};
		var invAdd = function(patch) {
		    patch.amount = -patch.amount;
		    return patch;
		};
		util.seq([
		    function(_) { obj.createObject(cls, {val:0}, _.to('h0')); },
		    function(_) { hashDB.hash(invAdd.toString(), _.to('invAdd')); },
		    function(_) { cb(undefined, this.h0, this.invAdd); },
		], cb)();
	    }
	    var hashDB = new HashDB(new DummyKVS());
	    var obj = new VCObj(hashDB);
	    util.seq([
		function(_) { createCounter(obj, hashDB, _.to('h0', 'invAdd')); },
		function(_) { obj.createChainPatch([{type: 'add', amount: 2, inv: this.invAdd}, 
						    {type: 'add', amount: 3, inv: this.invAdd}], _.to('p')); },
		function(_) { obj.apply(this.h0, this.p, _.to('h1')); },
		function(_) { obj.apply(this.h1, {type: 'get'}, _.to('h2', 'res')); },
		function(_) { assert.equal(this.res, 5); _(); },
	    ], done)();
	});
    });
    function createCounter(obj, hashDB, cb) {
	var cls = {
	    add: function(patch, ctx) {
		this.val += patch.amount;
		ctx.ret();
	    },
	    get: function(patch, ctx) {
		ctx.ret(this.val);
	    },
	};
	var invAdd = function(patch) {
	    patch.amount = -patch.amount;
	    return patch;
	};
	util.seq([
	    function(_) { obj.createObject(cls, {val:0}, _.to('h0')); },
	    function(_) { hashDB.hash(invAdd.toString(), _.to('invAdd')); },
	    function(_) { cb(undefined, this.h0, this.invAdd); },
	], cb)();
    }
    describe('trans(h1, patch, cb(h2, res, effect, conflict))', function(){
	it('should apply the given patch on h1 to receive h2', function(done){
	    var hashDB = new HashDB(new DummyKVS());
	    var obj = new VCObj(hashDB, new DummyKVS());
	    util.seq([
		function(_) { createCounter(obj, hashDB, _.to('h0', 'invAdd')); },
		function(_) { obj.trans(this.h0, {type: 'add', inv: this.invAdd, amount: 2}, _.to('h1')); },
		function(_) { obj.apply(this.h1, {type: 'get'}, _.to('h2', 'res')); },
		function(_) { assert.equal(this.res, 2); _(); },
	    ], done)();
	});
	it('should cache previous state/patch pairs and avoid re-calculation', function(done){
	    function createCounter(obj, hashDB, cb) {
		var cls = {
		    add: function(patch, ctx) {
			process._counterTest++; // Count the applications as a side-effect
			this.val += patch.amount;
			ctx.ret();
		    },
		    get: function(patch, ctx) {
			ctx.ret(this.val);
		    },
		};
		var invAdd = function(patch) {
		    patch.amount = -patch.amount;
		    return patch;
		};
		util.seq([
		    function(_) { obj.createObject(cls, {val:0}, _.to('h0')); },
		    function(_) { hashDB.hash(invAdd.toString(), _.to('invAdd')); },
		    function(_) { cb(undefined, this.h0, this.invAdd); },
		], cb)();
	    }
	    var hashDB = new HashDB(new DummyKVS());
	    var obj = new VCObj(hashDB, new DummyKVS());
	    process._counterTest = 0;
	    util.seq([
		function(_) { createCounter(obj, hashDB, _.to('h0', 'invAdd')); },
		function(_) { obj.trans(this.h0, {type: 'add', inv: this.invAdd, amount: 2}, _.to('h1')); },
		function(_) { obj.trans(this.h1, {type: 'add', inv: this.invAdd, amount: -2}, _.to('h2')); },
		function(_) { obj.trans(this.h2, {type: 'add', inv: this.invAdd, amount: 2}, _.to('h3')); },
		function(_) { obj.trans(this.h3, {type: 'add', inv: this.invAdd, amount: -2}, _.to('h4')); },
		function(_) { obj.trans(this.h4, {type: 'add', inv: this.invAdd, amount: 2}, _.to('h5')); },
		function(_) { obj.trans(this.h5, {type: 'add', inv: this.invAdd, amount: -2}, _.to('h6')); },
		function(_) { obj.trans(this.h6, {type: 'add', inv: this.invAdd, amount: 2}, _.to('h7')); },
		function(_) { obj.trans(this.h7, {type: 'add', inv: this.invAdd, amount: -2}, _); },
		function(_) { assert.equal(process._counterTest, 2); _(); },
	    ], done)();
	});

    });
});
