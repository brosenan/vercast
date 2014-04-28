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
bucketStore.async = true;

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
	    MyClass: {
		init: function(ctx, args) {},
		throwException: function(ctx, patch) {
		    throw new Error(patch.msg);
		},
		raiseConflict: function(ctx, patch) {
		    ctx.conflict();
		},
		hasEffect: function(ctx, patch) {
		    ctx.effect({_type: 'foo', arg: patch.arg});
		},
	    },
	    Nested: {
		init: function(ctx, args) {
		    if(args.depth > 0) {
			this.child = ctx.init('Nested', {depth: args.depth - 1});
		    } else {
			this.leaf = ctx.init('MyClass', {});
		    }
		},
		patch: function(ctx, patch) {
		    if(this.child) {
			var pair = ctx.trans(this.child, patch);
			this.child = pair[0];
			return pair[1];
		    } else {
			var pair = ctx.trans(this.leaf, patch.patch);
			this.leaf = pair[0];
			return pair[1];
		    }
		},
		patchWithEffect: function(ctx, patch) {
		    ctx.effect({_type: 'myEffect'});
		    if(this.child) {
			ctx.query(this.child, patch);
		    }
		},
	    },
	});
	var ostore = createOstore(disp);
	var counterVersion;
	var myObjVersion;
	beforeEach(function(done) {
	    var count = 2;
	    ostore.init('Counter', {}, function(err, v0) {
		counterVersion = v0;
		count--;
		if(count == 0) done();
	    });
	    ostore.init('Nested', {depth: 5}, function(err, v0) {
		myObjVersion = v0;
		count--;
		if(count == 0) done();
	    });
	});
	afterEach(function() {
	    cache.abolish();
	    bucketStore.abolish();
	});
	it('should apply patch p to v1, to receive v2', function(done){
	    ostore.transRaw(counterVersion, {_type: 'add', amount: 2}, function(err, v2, r, conf) {
		var obj = cache.fetch(v2.$);
		assert.ifError(err);
		assert(!conf, 'should not conflict');
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
	    ostore.transRaw(counterVersion, {_type: 'add', amount: 2}, function(err, v2, r, conf) {
		var obj = cache.fetch(v2.$);
		assert.ifError(err);
		assert(!conf, 'should not conflict');
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
	it('should return the conflict flag (in cache)', function(done){
	    ostore.transRaw(myObjVersion, {_type: 'patch', patch: {_type: 'raiseConflict'}}, function(err, v2, r, conf) {
		assert.ifError(err);
		assert(conf, 'should be conflicting');
		done();
	    });
	});
	it('should return the conflict flag (out of cache)', function(done){
	    cache.abolish();
	    ostore.transRaw(myObjVersion, {_type: 'patch', patch: {_type: 'raiseConflict'}}, function(err, v2, r, conf) {
		assert.ifError(err);
		assert(conf, 'should be conflicting');
		done();
	    });
	});
	it('should return all effect patches (in cache)', function(done){
	    ostore.transRaw(myObjVersion, {_type: 'patchWithEffect'}, function(err, v2, r, conf, eff) {
		assert.ifError(err);
		assert.equal(eff.length, 6);
		done();
	    });
	});
	it('should return all effect patches (out of cache)', function(done){
	    cache.abolish();
	    ostore.transRaw(myObjVersion, {_type: 'patchWithEffect'}, function(err, v2, r, conf, eff) {
		assert.ifError(err);
		assert.equal(eff.length, 6);
		done();
	    });
	});
    });
    describe('.trans(v1, ps, cb(err, v2, r, conf, w))', function(){
	var disp = new ObjectDisp({
	    Counter: require('../counter.js'),
	    MyClass: {
		init: function(ctx, args) {
		    this.counter = ctx.init('Counter', {});
		},
		counterPatch: function(ctx, patch) {
		    var pair = ctx.transQuery(this.counter, patch.patch);
		    this.counter = pair[0];
		    return pair[1];
		},
		raiseConflict: function(ctx, patch) {
		    ctx.conflict();
		},
		hasEffect: function(ctx, patch) {
		    ctx.effect(patch.eff);
		},
	    },
	});
	var ostore = createOstore(disp);
	var myObjVersion;
	beforeEach(function(done) {
	    ostore.init('MyClass', {depth: 5}, function(err, v0) {
		myObjVersion = v0;
		cache.abolish();
		done();
	    });
	});
	afterEach(function() {
	    cache.abolish();
	    bucketStore.abolish();
	});
	it('should perform transitions and return the result version and result', function(done){
	    ostore.trans(myObjVersion, [{_type: 'counterPatch', patch: {_type: 'add', amount: 4}}], function(err, v2) {
		if(err) return done(err);
		ostore.trans(v2, [{_type: 'counterPatch', patch: {_type: 'get'}}], function(err, v3, r) {
		    if(err) return done(err);
		    assert.equal(r[0], 4);
		    done();
		});
	    });
	});
	it('should perform a sequence of transitions, returning the result of each', function(done){
	    ostore.trans(myObjVersion, [{_type: 'counterPatch', patch: {_type: 'add', amount: 4}},
					{_type: 'counterPatch', patch: {_type: 'get'}},
					{_type: 'counterPatch', patch: {_type: 'add', amount: 2}},
					{_type: 'counterPatch', patch: {_type: 'get'}}],
			 function(err, v2, rs, conf, w) {
			     if(err) return done(err);
			     assert.equal(rs[1], 4);
			     assert.equal(rs[3], 6);
			     assert(!conf, 'should not be conflicting');
			     assert.equal(w, 4); // w should capture the overall number of patches applied
			     done();
			 });
	});
	it('should update the conflict flag appropriately', function(done){
	    ostore.trans(myObjVersion, [{_type: 'counterPatch', patch: {_type: 'add', amount: 4}},
					{_type: 'counterPatch', patch: {_type: 'get'}},
					{_type: 'raiseConflict'},
					{_type: 'counterPatch', patch: {_type: 'add', amount: 2}},
					{_type: 'counterPatch', patch: {_type: 'get'}}],
			 function(err, v2, rs, conf) {
			     if(err) return done(err);
			     assert.equal(rs[1], 4);
			     assert.equal(rs[4], 6);
			     assert(conf, 'should be conflicting');
			     done();
			 });
	});
	it('should apply effect patches resulting from previous patches, automatically', function(done){
	    ostore.trans(myObjVersion, [{_type: 'counterPatch', patch: {_type: 'add', amount: 4}},
					{_type: 'counterPatch', patch: {_type: 'get'}},
					{_type: 'hasEffect',
					 eff: {_type: 'counterPatch', patch: {_type: 'add', amount: 3}}},
					{_type: 'counterPatch', patch: {_type: 'get'}}],
			 function(err, v2, rs, conf, w) {
			     if(err) return done(err);
			     assert.equal(rs[1], 4);
			     assert.equal(rs[3], 4); // The effect has not been encountered yet
			     assert(!conf, 'should not be conflicting');
			     assert.equal(w, 5); // w captures the number of patches, including effect patches
			     ostore.trans(v2, [{_type: 'counterPatch', patch: {_type: 'get'}}], function(err, v3, rs) {
				 assert.equal(rs[0], 7);
				 done();
			     });
			 });
	});
    });
});
