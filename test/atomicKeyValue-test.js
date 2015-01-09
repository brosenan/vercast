"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen');
var vercast = require('vercast');

var newKey = function() {
    return 'k' + Math.floor(Math.random() * 1000000000);
}

module.exports = function(atomicKV) {
    describe('as AtomicKeyValue', function(){
	describe('.newKey(key, val)', function(){
	    it('should store a new key/value pair, given that key does not already exist', asyncgen.async(function*(){
		var key = newKey();
		yield* atomicKV.newKey(key, 'bar');
		var value = yield* atomicKV.retrieve(key);
		assert.equal(value, 'bar');
	    }));
	    it('should emit an error when the key already exists', asyncgen.async(function*(){
		var key = newKey();
		try {
		    yield* atomicKV.newKey(key, 'bar');
		    yield* atomicKV.newKey(key, 'bar');
		    assert(false, 'An error should be emitted');
		} catch(err) {
		    assert.equal(err.message, 'Key ' + key + ' already exists');
		}
	    }));
	});
	describe('.retrieve(key))', function(){
	    it('should emit an error if the value does not exist', asyncgen.async(function*(){
		var key = newKey();
		try {
		    var value = yield* atomicKV.retrieve(key);
		    assert(false, 'the value is not supposed to be found');
		} catch(err) {
		    assert.equal(err.message, 'Key ' + key + ' was not found');
		}
	    }));
	});
	describe('.modify(key, oldVal, newVal)', function(){
	    it('should change the value under key to newVal, given that the previous value was oldVal', asyncgen.async(function*(){
		var key = newKey();
		yield* atomicKV.newKey(key, 'bar');
		var valAfterMod = yield* atomicKV.modify(key, 'bar', 'baz');
		assert.equal(valAfterMod, 'baz');
		var val = yield* atomicKV.retrieve(key);
		assert.equal(val, 'baz');
	    }));
	    it('should not change the value under key if the current value does not equal oldVal', asyncgen.async(function*(){
		var key = newKey();
		yield* atomicKV.newKey(key, 'bar');
		var valAfterMod = yield* atomicKV.modify(key, 'baz', 'bat');
		//assert.equal(valAfterMod, 'bar'); // The value before the change
		var val = yield* atomicKV.retrieve(key);
		assert.equal(val, 'bar');
	    }));
	});
    });
};
