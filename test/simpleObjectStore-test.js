"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

describe('SinpleObjectStore', function(){
    function createOStroe(dispMap) {
	var disp = new vercast.ObjectDispatcher(dispMap);
	return new vercast.SimpleObjectStore(disp);
    }
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
	    var ostore = createOStroe(dispMap);
	    var v = yield* ostore.init('foo', {});
	    assert.equal(typeof v.$, 'string');
	    assert(called, 'The constructor should have been called');
	}));
    });
    describe('.trans(v, p, u) -> {v, r}', function(){
	it('should return the value returned from the method corresponding to patch p', asyncgen.async(function*(done){
	    var dispMap = {
		foo: {
		    init: function*() {
			this.baz = 0;
		    },
		    bar: function*() {
			this.baz += 1;
			return this.baz;
		    },
		},
	    };
	    var ostore = createOStroe(dispMap);
	    var v = yield* ostore.init('foo', {});
	    var pair = yield* ostore.trans(v, {_type: 'bar'});
	    assert.equal(pair.r, 1);
	    pair = (yield* ostore.trans(pair.v, {_type: 'bar'}));
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
	    var ostore = createOStroe(dispMap);
	    var v = yield* ostore.init('foo', {});
	    var pair = yield* ostore.trans(v, {_type: 'bar', amount: 3});
	    assert.equal(pair.r, 3);
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
		var ostore = createOStroe(dispMap);
		var creator = yield* ostore.init('creator', {});
		var foo1 = yield* ostore.trans(creator, {_type: 'create', type: 'foo', args: {value: 3}});
		var res = yield* ostore.trans(foo1.r, {_type: 'get'});
	    }));
	});
    });
});
