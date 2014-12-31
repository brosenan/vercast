"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var sleep = asyncgen.thunkify(function(msec, cb) { setTimeout(cb, msec); });

module.exports = function(createOStore) {
    describe('.init(type, args)', function(){
	it('should return a version ID of a newly created object', asyncgen.async(function*(done){
	    var called = false;
	    var dispMap = {
		foo: {
		    init: function*() {
			called = true;
		    },
		},
	    };
	    var ostore = createOStore(dispMap);
	    var v = yield* ostore.init('foo', {});
	    assert.equal(typeof v.$, 'string');
	    assert(called, 'The constructor should have been called');
	}));
	it('should support queries to other objects during the initialization', asyncgen.async(function*(){
	    var dispMap = {
		foo: {
		    init: function*(ctx, args) {
			assert.equal((yield* ctx.trans(args.bar, {_type: 'get'})).r, 'BAR');
		    },
		},
		bar: {
		    init: function*() {},
		    get: function*() { return 'BAR'; },
		},
	    };
	    var ostore = createOStore(dispMap);
	    var bar = yield* ostore.init('bar', {});
	    var v = yield* ostore.init('foo', {bar: bar});
	}));

    });
    describe('.trans(v, p, u) -> {v, r, eff}', function(){
	it('should return the value returned from the method corresponding to patch p', asyncgen.async(function*(done){
	    var dispMap = {
		foo: {
		    init: function*() {
			this.baz = 0;
		    },
		    bar: function*() {
			//yield sleep(1);
			this.baz += 1;
			return this.baz;
		    },
		},
	    };
	    var ostore = createOStore(dispMap);
	    var v = yield* ostore.init('foo', {});
	    var pair = yield* ostore.trans(v, {_type: 'bar'});
	    assert.equal(pair.r, 1);
	    pair = yield* ostore.trans(pair.v, {_type: 'bar'});
	    assert.equal(pair.r, 2);
	}));
	it('should pass the patch and u flag as parameters to the called method', asyncgen.async(function*(done){
	    var dispMap = {
		foo: {
		    init: function*() {
			this.baz = 0;
		    },
		    bar: function*(ctx, p, u) {
			var amount = p.amount;
			if(u) amount = -amount;
			this.baz += amount;
			return this.baz;
		    },
		},
	    };
	    var ostore = createOStore(dispMap);
	    var v = yield* ostore.init('foo', {});
	    var pair = yield* ostore.trans(v, {_type: 'bar', amount: 3});
	    assert.equal(pair.r, 3);
	    pair = yield* ostore.trans(pair.v, {_type: 'bar', amount: 2}, true);
	    assert.equal(pair.r, 1);
	}));
	it('should replace the object with another if replaced with its ID', asyncgen.async(function*(){
	    var dispMap = {
		foo:{
		    init: function*() {},
		    changeToBar: function*(ctx) {
			this._replaceWith(yield* ctx.init('bar', {}));
		    },
		},
		bar:{
		    init: function*() {},
		    query: function*() { return 555; },
		},
	    };
	    var ostore = createOStore(dispMap);
	    var v = yield* ostore.init('foo', {});
	    var res = yield* ostore.trans(v, {_type: 'changeToBar'});
	    res = yield* ostore.trans(res.v, {_type: 'query'});
	}));
	it('should throw an exception in case of a transformation that results in null', asyncgen.async(function*(){
	    var dispMap = {
		foo: {
		    init: function*() {},
		    turnToNull: function*() {
			this._replaceWith(null);
		    }
		},
	    };
	    var ostore = createOStore(dispMap);
	    var v = yield* ostore.init('foo', {});
	    try {
		yield* ostore.trans(v, {_type: 'turnToNull'});
		assert(false, "the previous statement should fail");
	    } catch(e) {
		assert.equal(e.message, "A patch cannot transform an object to null or undefined");
	    }
	}));
    });
    describe('context', function(){
	describe('.init(type, args)', function(){
	    it('should initialize an object with the given type and args and return its version ID', asyncgen.async(function*(){
		var dispMap = {
		    creator: {
			init: function*(ctx, args) {},
			create: function*(ctx, p, u) {
			    return yield* ctx.init(p.type, p.args);
			},
		    },
		    foo: {
			init: function*(ctx, args) { this.value = args.value; },
			get: function*() { return this.value; },
		    },
		};
		var ostore = createOStore(dispMap);
		var creator = yield* ostore.init('creator', {});
		var foo1 = yield* ostore.trans(creator, {_type: 'create', type: 'foo', args: {value: 3}});
		var res = yield* ostore.trans(foo1.r, {_type: 'get'});
		assert.equal(res.r, 3);
	    }));
	});
	describe('.trans(v, p, u) -> {v,r,eff}', function(){
	    it('should transform a version and return the new version ID and result', asyncgen.async(function*(){
		var dispMap = {
		    foo: {
			init: function*(ctx, args) {
			    this.bar = yield* ctx.init('bar', {});
			},
			add: function*(ctx, p, u) {
			    var pair = yield* ctx.trans(this.bar, p, u);
			    this.bar = pair.v;
			    return pair.r;
			},
		    },
		    bar: {
			init: function*() {
			    this.value = 0;
			},
			add: function*(ctx, p, u) {
			    this.value += (u?-1:1) * p.amount;
			    return this.value;
			},
		    },
		};
		var ostore = createOStore(dispMap);
		var foo = yield* ostore.init('foo', {});
		var pair = yield* ostore.trans(foo, {_type: 'add', amount: 3});
		assert.equal(pair.r, 3);
		pair = yield* ostore.trans(pair.v, {_type: 'add', amount: 2}, true);
		assert.equal(pair.r, 1);
	    }));
	});
	describe('.conflict(msg)', function(){
	    it('should throw an exception with .isConflict set to true', asyncgen.async(function*(){
		var dispMap = {
		    foo: {
			init: function*() {},
			raise: function*(ctx, p, u) { ctx.conflict('foo raises a conflict'); },
		    },
		};
		var ostore = createOStore(dispMap);
		var foo = yield* ostore.init('foo', {});
		try {
		    yield* ostore.trans(foo, {_type: 'raise'});
		    assert(false, 'should not be here');
		} catch(e) {
		    if(!e.isConflict) {
			throw e;
		    }
		}
	    }));
	});
	describe('.effect(p)', function(){
	    it('should add patch p to the effect sequence', asyncgen.async(function*(){
		var dispMap = {
		    foo: {
			init: function*() {},
			eff: function*(ctx, p, u) {
			    yield* ctx.effect(p.patch);
			},
		    },
		};
		var ostore = createOStore(dispMap);
		var foo = yield* ostore.init('foo', {});
		var res = yield* ostore.trans(foo, {_type: 'eff', patch: {p:123}}, false);
		var seqStore = ostore.getSequenceStore();
		yield* seqStore.append(res.eff);
		assert(!seqStore.isEmpty(), 'sequence should contain an element');
		assert.deepEqual(yield* seqStore.shift(), {p:123});
	    }));
	    it('should add patches to the effect set even when called from a nested transformation', asyncgen.async(function*(){
		var dispMap = {
		    foo: {
			init: function*(ctx) { this.bar = yield* ctx.init('bar', {}); },
			eff: function*(ctx, p, u) {
			    yield* ctx.effect({p:333});
			    this.bar = (yield* ctx.trans(this.bar, p, u)).v;
			},
		    },
		    bar: {
			init: function*() {},
			eff: function*(ctx, p, u) {
			    yield* ctx.effect(p.patch);
			},
		    },
		};
		var ostore = createOStore(dispMap);
		var foo = yield* ostore.init('foo', {});
		var res = yield* ostore.trans(foo, {_type: 'eff', patch: {p:123}}, false);
		var seqStore = ostore.getSequenceStore();
		yield* seqStore.append(res.eff);
		assert.deepEqual(yield* seqStore.shift(), {p:333});
		assert.deepEqual(yield* seqStore.shift(), {p:123});
	    }));
	});
	describe('.self()', function(){
	    it('should return the version ID of the object prior to this patch application', asyncgen.async(function*(){
		var dispMap = {
		    foo: {
			init: function*() { this.value = 44; },
			bar: function*(ctx, p, u) {
			    this.value = 999;
			    return yield* ctx.trans(ctx.self(), {_type: 'baz'});
			},
			baz: function*(ctx, p, u) {
			    return this.value;
			},
		    },
		};
		var ostore = createOStore(dispMap);
		var foo = yield* ostore.init('foo', {});
		var res = yield* ostore.trans(foo, {_type: 'bar'});
	    }));
	});
	describe('.clone(obj)', function(){
	    it('should return a value equivalent to obj but not a reference', asyncgen.async(function*(){
		var val;
		var dispMap = {
		    foo: {
			init: function*(ctx, args) { this.value = args.value; },
			bar: function*(ctx, p, u) {
			    val = ctx.clone(this.value);
			},
		    },
		};
		var ostore = createOStore(dispMap);
		var foo = yield* ostore.init('foo', {value: 42});
		var res = yield* ostore.trans(foo, {_type: 'bar'});
		assert.equal(val, 42);

		foo = yield* ostore.init('foo', {value: [42]});
		res = yield* ostore.trans(foo, {_type: 'bar'});
		assert.deepEqual(val, [42]);
	    }));
	    it('should properly handle null', asyncgen.async(function*(){
		var val;
		var dispMap = {
		    foo: {
			init: function*(ctx, args) { this.value = args.value; },
			bar: function*(ctx, p, u) {
			    val = ctx.clone(this.value);
			},
		    },
		};
		var ostore = createOStore(dispMap);
		var foo = yield* ostore.init('foo', {value: null});
		var res = yield* ostore.trans(foo, {_type: 'bar'});
		assert.equal(val, null);
	    }));

	});
    });
}

module.exports.describeCachedObjectStore = function(createOStore) {
    it('should avoid running the patch method again if the patch has already been applied on an identical object', asyncgen.async(function*(){
	var count = 0;
	var dispMap = {
	    foo: {
		init: function*() { this.x = 0; },
		bar: function*(ctx, p, u) {
		    count += 1;
		    this.x += 1;
		},
	    },
	};
	var ostore = createOStore(dispMap);
	var v0 = yield* ostore.init('foo', {});
	var v1 = (yield* ostore.trans(v0, {_type: 'bar'})).v;
	assert.equal(count, 1);
	var v1Prime = (yield* ostore.trans(v0, {_type: 'bar'})).v;
	assert.equal(v1.$, v1Prime.$);
	// This should not have required a call to the patch handler
	assert.equal(count, 1);
    }));
};