var assert = require('assert');
var ObjectDisp = require('../objectDisp.js');
var BucketObjectStore = require('../bucketObjectStore.js');
var SimpleCache = require('../simpleCache.js');
var vercast = require('../vercast.js');
var DummyBucketStore = require('../dummyBucketStore.js');
var AsyncObjectStore = require('../asyncObjectStore.js');
var Scheduler = require('../scheduler.js');

var sched = new Scheduler();
var cache = new SimpleCache(sched);
var bucketStore = new DummyBucketStore(sched);

function createOstore(disp) {
    return new AsyncObjectStore(new BucketObjectStore(disp, cache, bucketStore), sched);
}

describe('AsyncObjectStore', function(){
    describe('.init(className, args, cb(err, v0))', function(){
	it('should initialize an object of class className with arguments args and return the ID', function(done){
	    var called = false;
	    var disp = new ObjectDisp({
		Class1: {
		    init: function(ctx, args) {
			called = true;
			this.foo = args.bar;
		    }
		},
		Class2: {
		    init: function(ctx, args) {
			assert(false, 'Class2\'s constructor should not be called');
		    }
		}
	    });
	    var ostore = createOstore(disp);
	    ostore.init('Class1', {bar: 12}, function(err, v0) {
		assert.ifError(err);
		assert(called, 'Constructor should have been called');
		var obj = cache.fetch(v0.$);
		assert.equal(obj.foo, 12);
		done();
	    });
	});
    });
    describe('.transRaw(v1, p, cb(err, v2, r, conf, eff))', function(){
	var disp = new ObjectDisp({
	    Counter: require('../counter.js'),
	});
	var ostore = createOstore(disp);
	var counterVersion;
	beforeEach(function(done) {
	    ostore.init('Counter', {}, function(err, v0) {
		counterVersion = v0;
		done();
	    });
	});
	afterEach(function() {
	    cache.abolish();
	    bucketStore.abolish();
	});
	it('should apply patch p to v1, to receive v2', function(done){
	    ostore.transRaw(counterVersion, {_type: 'add', amount: 2}, function(err, v2) {
		var obj = cache.fetch(v2.$);
		assert.equal(obj.value, 2);
		done();
	    });
	});
	it('should return the result r of the patch', function(done){
	    ostore.transRaw(counterVersion, {_type: 'get'}, function(err, v2, r) {
		assert.equal(r, 0);
		done();
	    });
	});
	it('should return the result version even if the source version is not in the cache', function(done){
	    cache.abolish();
	    ostore.transRaw(counterVersion, {_type: 'add', amount: 2}, function(err, v2) {
		var obj = cache.fetch(v2.$);
		assert.equal(obj.value, 2);
		done();
	    });
	});
	it('should return the result r even if the source version is not in the cache', function(done){
	    cache.abolish();
	    ostore.transRaw(counterVersion, {_type: 'get'}, function(err, v2, r) {
		assert.equal(r, 0);
		done();
	    });
	});
    });
});
