"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen');
var vercast = require('vercast');

var newKey = function() {
    return 'k' + Math.floor(Math.random() * 1000000000);
}

module.exports = function(kvs) {
    describe('.newKey(key, value)', function(){
	it('should store a new key/value pair given that the method is called only once for that key', asyncgen.async(function*(){
	    var key = newKey();
	    yield* kvs.newKey(key, 'foo');
	}));
    });
    describe('.retrieve(key)', function(){
	it('should return a previously-assigned value of the key, or undefined the value has not yet been regiested', asyncgen.async(function*(){
	    var key = newKey();
	    yield* kvs.newKey(key, 'bar');
	    var value;
	    while(!value) {
		value = yield* kvs.retrieve(key);
		yield function(_) { setTimeout(_, 1); };
	    }
	    assert.equal(value, 'bar');
	}));
    });
    describe('.modify(key, value)', function(){
	it('should change the value so that it eventually becomes the given one', asyncgen.async(function*(){
	    var key = newKey();
	    yield* kvs.newKey(key, 'bar');
	    var value;
	    while(!value) {
		value = yield* kvs.retrieve(key);
		yield function(_) { setTimeout(_, 1); };
	    }
	    yield* kvs.modify(key, 'baz');
	    while(value === 'bar') {
		value = yield* kvs.retrieve(key);
		yield function(_) { setTimeout(_, 1); };
	    }
	    assert.equal(value, 'baz');
	}));
    });
};
