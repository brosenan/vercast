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

});
