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
});
