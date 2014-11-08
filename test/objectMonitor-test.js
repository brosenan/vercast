"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

describe('ObjectMonitor', function(){
    describe('.proxy()', function(){
	it('should allow modifying an object through a proxy', function(){
	    var obj = {a:1, b:2};
	    var monitor = new vercast.ObjectMonitor(obj);
	    var proxy = monitor.proxy();
	    assert.equal(proxy.a, 1);
	    proxy.a = 3;
	    assert.equal(obj.a, 3);
	});
	it('should wrap objects (including arrays) with map proxies', function(){
	    var obj = {a:1, b:2};
	    var monitor = new vercast.ObjectMonitor(obj);
	    var proxy = monitor.proxy();
	    proxy.a = [1, 2, 3];
	    try {
		proxy.a[0] = 4;
		assert(false, '');
	    } catch(e) {
		var goodError = "Can't add property 0, object is not extensible";
		if(e.message.substring(0, goodError.length) !== goodError) {
		    throw e;
		}
	    }
	});
	it('should provide access to child object fields via get/put methods, that update the dirty flag', function(){
	    var obj = {a:1, b:2};
	    var monitor = new vercast.ObjectMonitor(obj);
	    var proxy = monitor.proxy();
	    assert(!monitor.isDirty(), 'should not be dirty');
	    proxy.a = [1, 2, 3];
	    assert(monitor.isDirty(), 'should be dirty after adding updating a to an array');
	    assert(!monitor.isDirty(), 'dirty flag should have been reset');
	    assert.equal(proxy.a.get(1), 2);
	    proxy.a.put(2, 5);
	    assert(monitor.isDirty(), 'should be dirty after updating the value');
	    assert.equal(proxy.a.get(2), 5);
	});
	it('should retain the original object as a simple, JSON-style object', function(){
	    var obj = {a:1, b:2};
	    var monitor = new vercast.ObjectMonitor(obj);
	    var proxy = monitor.proxy();
	    proxy.a = [1, 2, 3];
	    assert.deepEqual(obj, {a:[1, 2, 3], b:2});
	    proxy.a.put(2, 4);
	    assert.deepEqual(obj, {a:[1, 2, 4], b:2});
	});
	it('should use map proxies recursively', function(){
	    var obj = {a:1, b:2};
	    var monitor = new vercast.ObjectMonitor(obj);
	    var proxy = monitor.proxy();
	    proxy.a = [1, 2, 3];
	    proxy.a.put(2, {x:1, y: 2});
	    try {
		proxy.a.get(2).x = 3;
		assert(false, 'previous statement should fail');
	    } catch(e) {
		var goodError = "Can't add property x, object is not extensible";
		if(e.message.substring(0, goodError.length) !== goodError) {
		    throw e;
		}
	    }
	    assert.equal(proxy.a.get(2).get('x'), 1);
	    monitor.isDirty(); // reset the dirty flag
	    proxy.a.get(2).put('x', 4);
	    assert(monitor.isDirty(), 'should be dirty now');
	    assert.equal(proxy.a.get(2).get('x'), 4);
	});
	it('should return an unextensible proxy object', function(){
	    var obj = {a:1, b:2};
	    var monitor = new vercast.ObjectMonitor(obj);
	    var proxy = monitor.proxy();
	    try {
		proxy.c = 4;
		assert(false, 'the previous statement should fail');
	    } catch(e) {
		var goodError = "Can't add property c, object is not extensible";
		if(e.message !== goodError) {
		    throw e;
		}
	    }
	});

    });
    describe('.isDirty()', function(){
	it('should indicate if a change to the object has been made since the last time it has been called', function(){
	    var obj = {a:1, b:2};
	    var monitor = new vercast.ObjectMonitor(obj);
	    var proxy = monitor.proxy();
	    assert(!monitor.isDirty(), 'monitor should not be dirty yet');
	    proxy.a = 3;
	    assert(monitor.isDirty(), 'monitor should now be dirty');
	    assert(!monitor.isDirty(), 'monitor should not be dirty anymore');
	});
    });
    describe('.hash()', function(){
	it('should return a unique string representing the content of the object', function(){
	    var obj = {a:1, b:2};
	    var monitor = new vercast.ObjectMonitor(obj);
	    var proxy = monitor.proxy();
	    proxy.a = [1, 2, 3];
	    var hash1 = monitor.hash();
	    assert.equal(typeof hash1, 'string');
	    proxy.a.put(0, 4);
	    var hash2 = monitor.hash();
	    assert.notEqual(hash1, hash2);
	    proxy.a.put(0, 1);
	    var hash3 = monitor.hash();
	    assert.equal(hash3, hash1);
	});
	it('should work regardless of dirty testing', function(){
	    var obj = {a:1, b:2};
	    var monitor = new vercast.ObjectMonitor(obj);
	    var proxy = monitor.proxy();
	    proxy.a = [1, 2, 3];
	    var hash1 = monitor.hash();
	    assert.equal(typeof hash1, 'string');
	    proxy.a.put(0, 4);
	    monitor.isDirty();
	    var hash2 = monitor.hash();
	    assert.notEqual(hash1, hash2);
	});

    });

});
