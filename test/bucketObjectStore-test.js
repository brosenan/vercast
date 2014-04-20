var assert = require('assert');
var ObjectDisp = require('../objectDisp.js');
var BucketObjectStore = require('../bucketObjectStore.js');
var DummyBucketStore = require('../dummyBucketStore.js');
var SimpleCache = require('../simpleCache.js');
var vercast = require('../vercast.js');
var descObjectStore = require('./descObjectStore.js');

var cache = new SimpleCache();
var bucketStore = new DummyBucketStore();
describe('BucketObjectStore', function(){
    afterEach(function() {
	bucketStore.abolish();
	cache.abolish();
    });
    var ostore = descObjectStore(function(disp) { return new BucketObjectStore(disp, cache, bucketStore); });
    describe('.hash(bucket, obj)', function(){
	it('should return a unique ID for each given object and bucket ID', function(done){
	    var id1 = ostore.hash('foo', {bar: 1});
	    var id2 = ostore.hash('foo', {bar: 2});
	    var id3 = ostore.hash('food', {bar: 1});
	    assert(id1.$ != id2.$, 'Object should matter');
	    assert(id1.$ != id3.$, 'Bucket should matter');
	    done();
	});
	it('should cache the object under its ID', function(done){
	    var id2 = ostore.hash('foo', {bar: 2});
	    assert.equal(cache.fetch(id2.$).bar, 2);
	    done();
	});
    });
    describe('.unhash(id)', function(){
	it('should return the object corresponding to id, if in the cache', function(done){
	    var id = ostore.hash('foo', {bar: 2});
	    assert.equal(ostore.unhash(id).bar, 2);
	    done();
	});
	it('should return the contents of an object given its ID, if in the cache', function(done){
	    var id = ostore.init({}, 'Counter', {});
	    assert.equal(ostore.unhash(id).value, 0);
	    done();
	});
	it('should put things in motion to retrieve the value of the ID, if not in the cache', function(done){
	    var id = ostore.init({}, 'Counter', {});
	    cache.abolish();
	    var id2 = ostore.unhash(id);
	    assert.equal(typeof id2, 'undefined');
	    cache.waitFor([id.$], done);
	});
    });
    describe('.trans(ctx, v1, p)', function(){
	it('should return v2=undefined if v1 is not in cache', function(done){
	    var ctx = {};
	    var v1 = ostore.init(ctx, 'Counter', {});
	    cache.abolish();
	    var pair = ostore.trans(ctx, v1, {_type: 'add', amount: 10});
	    assert.equal(typeof pair[0], 'undefined');
	    done();
	});
	it('should add a field named "waitFor" to the context, containing a list of cache entries.  Waiting on them assures .trans() returns value', function(done){
	    var ctx = {};
	    var v1 = ostore.init(ctx, 'Counter', {});
	    cache.abolish();
	    var pair = ostore.trans(ctx, v1, {_type: 'add', amount: 10});
	    assert.equal(typeof pair[0], 'undefined');
	    cache.waitFor(ctx.waitFor, function() {
		var pair = ostore.trans(ctx, v1, {_type: 'add', amount: 10});
		assert(pair[0], 'Should return value');
		done();
	    });
	});
	it('should support recursive transitions', function(done){
	    var ctx = {};
	    var v = ostore.init(ctx, 'BinTree', {key: 'a', value: 1});
	    v = ostore.trans(ctx, v, {_type: 'add', key: 'b', value: 2})[0];
	    v = ostore.trans(ctx, v, {_type: 'add', key: 'c', value: 3})[0];
	    var r = ostore.trans(ctx, v, {_type: 'fetch', key: 'c'})[1];
	    assert.equal(r, 3);
	    done();
	});
	it('should support recursive transitions even at the event of not having items in the cache (waitFor should be filled accordingly)', function(done){
	    var ctx = {};
	    var v = ostore.init(ctx, 'BinTree', {key: 'a', value: 1});
	    v = ostore.trans(ctx, v, {_type: 'add', key: 'b', value: 2})[0];
	    cache.abolish();
	    ctx = {};
	    var v1 = ostore.trans(ctx, v, {_type: 'add', key: 'c', value: 3})[0];
	    assert.equal(typeof v1, "undefined");
	    cache.waitFor(ctx.waitFor, function() {
		v = ostore.trans(ctx, v, {_type: 'add', key: 'c', value: 3})[0];
		var r = ostore.trans(ctx, v, {_type: 'fetch', key: 'c'})[1];
		assert.equal(r, 3);
		done();
	    });
	});
    });
    describe.skip('A 1000 element tree', function(){
//	vercast.trace_on = true;
	var thousand = 1000;
	var v;
	beforeEach(function() {
	    var numbers = [];
	    for(var i = 0; i < thousand; i++) numbers.push(i);
	    var first = true;
	    while(numbers.length > 0) {
		var index = Math.floor(Math.random() * numbers.length);
		var key = numbers.splice(index, 1)[0];
		if(first) {
		    v = ostore.init({}, 'BinTree', {key: key, value: key * 2});
		    first = false;
		} else {
		    v = ostore.trans({}, v, {_type: 'add', key: key, value: key * 2})[0];
		}
	    }
	    cache.abolish();
	});
	it('should recall any number', function(done){
	    //console.log('=============');
	    var ctx = {};
	    var numToFetch = Math.floor(Math.random() * thousand);
	    var p = {_type: 'fetch', key: numToFetch};
	    ostore.trans(ctx, v, p);
	    cache.waitFor(ctx.waitFor, function() {
		//console.log('-------------');
		var ctx = {};
		var res = ostore.trans(ctx, v, p)[1];
		assert.equal(res, numToFetch * 2);
		//console.log('=============');
		done();
	    });
	});
	it('should call make a reasonable number of calls to the bucket store', function(done){
	    var baseline = bucketStore.callCount;
	    var ctx = {};
	    var numToFetch = Math.floor(Math.random() * thousand);
	    var p = {_type: 'fetch', key: numToFetch};
	    //console.log('================');
	    ostore.trans(ctx, v, p);
	    cache.waitFor(ctx.waitFor, function() {
		var ctx = {};
		var res = ostore.trans(ctx, v, p)[1];
		assert.equal(res, numToFetch * 2);
		var accessCount = bucketStore.callCount - baseline;
		assert(accessCount < 6, 'Bucket store was consulted ' + accessCount + ' times');
		done();
	    });
	});
    });
});
