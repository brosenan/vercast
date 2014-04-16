var assert = require('assert');
var SimpleCache = require('../simpleCache.js');

describe('SimpleCache', function(){
    describe('.store(id, obj[, json])', function(){
	it('should store an object in the cache under the given ID', function(done){
	    var cache = new SimpleCache();
	    cache.store('one', {value: 1});
	    cache.store('two', {value: 2});
	    cache.store('three', {value: 3});
	    assert.equal(cache.fetch('one').value, 1);
	    assert.equal(cache.fetch('two').value, 2);
	    assert.equal(cache.fetch('three').value, 3);
	    done();
	});
	it('should retrieve the same instance on a first fetch', function(done){
	    var cache = new SimpleCache();
	    var one = {value: 1};
	    cache.store('one', one);
	    one.value = 2;
	    assert.equal(cache.fetch('one').value, 2);
	    done();
	});
	it('should retrieve the same object once and again, even if it was modified on the outside', function(done){
	    var cache = new SimpleCache();
	    cache.store('one', {value: 1});
	    var one = cache.fetch('one');
	    one.value = 2;
	    assert.equal(cache.fetch('one').value, 1);
	    done();
	});
	it('should use the json argument, if supplied, as the JSON representation of the object to be used when the instance is no longer available', function(done){
	    var cache = new SimpleCache();
	    cache.store('one', {value: 1}, JSON.stringify({value: 2}));
	    assert.equal(cache.fetch('one').value, 1); // first time
	    assert.equal(cache.fetch('one').value, 2); // second time
	    assert.equal(cache.fetch('one').value, 2); // third time
	    done();
	});

    });
    describe('.fetch(id)', function(){
    });
    describe('.abolish()', function(){
	it('should remove all elements from the cache', function(done){
	    var cache = new SimpleCache();
	    cache.store('one', {value: 1});
	    cache.store('two', {value: 2});
	    cache.store('three', {value: 3});
	    cache.abolish();
	    assert.equal(typeof cache.fetch('one'), 'undefined');
	    assert.equal(typeof cache.fetch('two'), 'undefined');
	    assert.equal(typeof cache.fetch('three'), 'undefined');
	    done();
	});
    });
    describe('.waitFor(keys, callback)', function(){
	it('should call the given callback once all keys are in the cache', function(done){
	    var cache = new SimpleCache();
	    var called = false;
	    cache.waitFor(['foo', 'bar'], function() {
		called = true;
	    });
	    cache.store('foo', 12);
	    assert(!called, 'Callback should not have been called yet');
	    cache.store('bar', 21);
	    assert(called, 'Callback should have been called');
	    done();
	});
	it('should throw an exception if one of the keys is already in the cache', function(done){
	    var cache = new SimpleCache();
	    cache.store('foo', 12);
	    try {
		cache.waitFor(['foo', 'bar'], function() {
		    assert(false, 'Callback should not have been called');
		});
		assert(false, 'An exception should have been thrown');
	    } catch(e) {
		assert.equal(e.message, 'Key foo already in cache');
	    }
	    done();
	});
    });
    describe('.check(key)', function(){
	it('should return true if key exists in the cache', function(done){
	    var cache = new SimpleCache();
	    cache.store('foo', 14);
	    assert(cache.check('foo'), 'foo is in the cache');
	    assert(!cache.check('bar'), 'bar is not in the cache');
	    done();
	});

    });

});
