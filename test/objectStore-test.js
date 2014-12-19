"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var kvs = new vercast.DummyKeyValueStore();
var sequenceStoreFactory = new vercast.SequenceStoreFactory(kvs);

describe('ObjectStore', function(){
    it('should pass an initially empty context object to the storage object', asyncgen.async(function*(){
	var dispMap = {
	    foo: {
		init: function*() {},
		fooPatch: function*() { return "FOO"; },
	    },
	};
	var storage = {
	    storeNewObject: function*(ctx, obj) {
		assert.deepEqual(ctx, {});
		return 'foo';
	    },
	    checkCache: function*(ctx, v, p) {
		assert.deepEqual(ctx, {});
		assert.equal(v, 'foo');
		assert.deepEqual(p, {_type: 'fooPatch'});
	    },
	    retrieve: function*(ctx, id) {
		assert.deepEqual(ctx, {});
		assert.equal(id, 'foo');
		return new vercast.ObjectMonitor({_type: 'foo'});
	    },
	    storeVersion: function*(ctx, v, p, monitor, r, eff) {
		assert.deepEqual(ctx, {});
		assert.equal(v, 'foo');
		assert.deepEqual(p, {_type: 'fooPatch'});
		assert.equal(monitor.proxy()._type, 'foo');
		assert.equal(r, 'FOO');
		assert.equal(eff, '');
	    },
	    deriveContext: function() {},
	};
	var ostore = new vercast.ObjectStore(new vercast.ObjectDispatcher(dispMap), sequenceStoreFactory, storage);
	var foo = yield* ostore.init('foo', {});
	yield* ostore.trans(foo, {_type: 'fooPatch'});
    }));

    it('should pass to underlying calls the derived context', asyncgen.async(function*(){
	var dispMap = {
	    foo: {
		init: function*(ctx) { this.bar = yield* ctx.init('bar', {}); },
		fooPatch: function*(ctx, p, u) { return (yield* ctx.trans(this.bar, {_type: 'barPatch'})).r; },
	    },
	    bar: {
		init: function*() {},
		barPatch: function*() { return "BAR"; },
	    },
	};
	function checkContext(v, ctx) {
	    if(v === 'bar') {
		assert.equal(ctx.v, 'foo');
		assert.equal(ctx.p._type, 'fooPatch');
	    }
	}
	var kvs = {};
	var storage = {
	    storeNewObject: function*(ctx, obj) {
		kvs[obj._type] = obj;
		return obj._type;
	    },
	    checkCache: function*(ctx, v, p) {
		checkContext(v, ctx);
	    },
	    deriveContext: function(ctx, v, p) {
		return {v: v, p: p};
	    },
	    retrieve: function*(ctx, id) {
		checkContext(id, ctx);
		return new vercast.ObjectMonitor(kvs[id]);
	    },
	    storeVersion: function*(ctx, v, p, monitor, r, eff) {
		checkContext(v, ctx);
	    },
	};
	var ostore = new vercast.ObjectStore(new vercast.ObjectDispatcher(dispMap), sequenceStoreFactory, storage);
	var foo = yield* ostore.init('foo', {});
	yield* ostore.trans(foo, {_type: 'fooPatch'});
    }));
});
