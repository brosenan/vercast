"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var bucketStore = new vercast.DummyBucketStore();

describe('BucketObjectStorage', function(){
    beforeEach(asyncgen.async(function*() {
	yield* bucketStore.clear();
    }));
    it('should create a new bucket object by calling createBucket() when using a new bucket ID', asyncgen.async(function*(){
	var called = false;
	function createBucket() {
	    called = true;
	    return {
		store: function() {},
	    };
	}
	var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	yield* storage.storeNewObject({bucket: 'xyz'}, {_type: 'someObject'});
	assert(called, 'should be called');

	called = false;
	yield* storage.storeNewObject({bucket: 'xyz'}, {_type: 'someOtherObject'});
	assert(!called, 'should not have been called again');
    }));
    it('should call the new bucket object\'s add() method with every existing element in the bucket', asyncgen.async(function*(){
	var elements = [{a:1}, {a:2}, {a:3}];
	yield* bucketStore.append('foo', elements);
	var received = [];
	function createBucket() {
	    return {
		store: function() {},
		add: function(elem) {
		    received.push(elem);
		},
	    };
	}
	var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	yield* storage.storeNewObject({bucket: 'foo'}, {_type: 'someObject'});
	assert.deepEqual(received, elements);
    }));
    it('should store to the bucket all elements emitted by the bucket object, and add them back', asyncgen.async(function*(){
	var added = [];
	function createBucket() {
	    return {
		storeIncoming: function(v1, p, monitor, r, eff, emit) {
		    emit({a:1});
		    emit({a:2});
		},
		storeOutgoing: function() {},
		add: function(elem) {
		    added.push(elem);
		},
	    };
	}
	var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	yield* storage.storeVersion({bucket: 'xyz'}, 
				    '1234-5678', 
				    {_type: 'somePatch'},
				    new vercast.ObjectMonitor({_type: 'someObject'}),
				    123, 'someEff');
	assert.deepEqual(yield* bucketStore.retrieve('1234'), [{a:1}, {a:2}]);

	// And again...
	yield* storage.storeVersion({bucket: 'xyz'}, 
				    '1234-5678', 
				    {_type: 'somePatch'},
				    new vercast.ObjectMonitor({_type: 'someObject'}),
				    123, 'someEff');
	assert.deepEqual(yield* bucketStore.retrieve('1234'), [{a:1}, {a:2}, {a:1}, {a:2}]);
    }));
    it('should store emitions from underlying operations', asyncgen.async(function*(){
	var added = [];
	function createBucket() {
	    return {
		add: function(elem) {
		    added.push(elem);
		},
		store: function(obj, emit) {
		    emit({a:3});
		    emit({a:4});
		},
		storeIncoming: function() { return 'newver'; },
		storeOutgoing: function(v, p, monitor, r, eff, emit) {
		    emit({a:5});
		    emit({a:6});
		},
		storeInternal: function(v, p, monitor, r, eff, emit) {
		    emit({a:7});
		    emit({a:8});
		},
	    };
	}
	var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	var ctx = storage.deriveContext({}, '1234-5678', {_type: 'somePatch'});
	yield* storage.storeNewObject(ctx, {_type: 'someObj'});
	yield* storage.storeVersion(ctx, '2345-6789', {_type: 'somePatch'}, monitor, undefined, '');
	yield* storage.storeVersion(ctx, '1234-9999', {_type: 'somePatch'}, monitor, undefined, '');
	var monitor = new vercast.ObjectMonitor({_type: 'someObj'});
	yield* storage.storeVersion({}, '1234-5678', {_type: 'someOtherPatch'}, monitor, undefined, '');
	assert.deepEqual(yield* bucketStore.retrieve('1234'), []); // should not store events for unrelated application
	yield* storage.storeVersion({}, '1234-5678', {_type: 'somePatch'}, monitor, undefined, '');
	assert.deepEqual(yield* bucketStore.retrieve('1234'), [{a:3}, {a:4}, {a:5}, {a:6}, {a:7}, {a:8}]);
    }));

    it('should not store emitions from underlying operations if the top level operation retained the version ID', asyncgen.async(function*(){
	var added = [];
	function createBucket() {
	    return {
		add: function(elem) {
		    added.push(elem);
		},
		store: function(obj, emit) {
		    emit({a:3});
		    emit({a:4});
		},
		storeIncoming: function(v, p, monitor, r, eff, emit) { return v.split('-')[1]; },
		storeOutgoing: function(v, p, monitor, r, eff, emit) {
		    emit({a:5});
		    emit({a:6});
		},
	    };
	}
	var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	var ctx = storage.deriveContext({}, '1234-5678', {_type: 'somePatch'});
	yield* storage.storeNewObject(ctx, {_type: 'someObj'});
	var monitor = new vercast.ObjectMonitor({_type: 'someObj'});
	yield* storage.storeVersion({}, '1234-5678', {_type: 'somePatch'}, monitor, undefined, '');
	assert.deepEqual(yield* bucketStore.retrieve('1234'), []);
    }));
    it('should use LRU policy to limit the number of buckets open simultaneously', asyncgen.async(function*(){
	yield* bucketStore.append('x', [{this_is: 'x'}]);
	yield* bucketStore.append('y', [{this_is: 'y'}]);
	yield* bucketStore.append('z', [{this_is: 'z'}]);
	var lastExtracted;
	function createBucket() {
	    return {
		add: function(elem) {
		    lastExtracted = elem.this_is;
		},
		checkCache: function() {},
	    };
	}

	var storage = new vercast.BucketObjectStorage(bucketStore, createBucket, {maxOpenBuckets: 2});
	yield* storage.checkCache({bucket: 'x'}, 'x-aaa', {_type: 'somePatch'});
	yield* storage.checkCache({bucket: 'y'}, 'y-aaa', {_type: 'somePatch'});
	// The following statement will replace x with z
	yield* storage.checkCache({bucket: 'z'}, 'z-aaa', {_type: 'somePatch'});
	yield* storage.checkCache({bucket: 'y'}, 'y-aaa', {_type: 'somePatch'});
	// y should still be in cache; z was the last one extracted
	assert.equal(lastExtracted, 'z');
	// Now we need to re-extract x
	yield* storage.checkCache({bucket: 'x'}, 'x-aaa', {_type: 'somePatch'});
	assert.equal(lastExtracted, 'x');
    }));


    describe('.deriveContext(ctx, v, p)', function(){
	it('should store the version\'s bucket ID in  the context', asyncgen.async(function*(){
	    var storage = new vercast.BucketObjectStorage();
	    var newCtx = storage.deriveContext({}, "1234-5678", {});
	    assert.equal(newCtx.bucket, '1234');
	}));
	it('should assign the originator version-patch ID for a new bucket', asyncgen.async(function*(){
	    var storage = new vercast.BucketObjectStorage();
	    var ctx1 = storage.deriveContext({}, "1234-5678", {_type: 'foo'});
	    assert.equal(ctx1.originator.substr(0, 5), '5678-');
	    // within the same bucket
	    var ctx2 = storage.deriveContext(ctx1, "1234-9999", {_type: 'bar'}); 
	    assert.equal(ctx2.originator, ctx1.originator);
	    // going to another bucket
	    var ctx3 = storage.deriveContext(ctx1, "3456-9999", {_type: 'baz'}); 
	    assert.notEqual(ctx3.originator, ctx2.originator);
	    // same version, different patch
	    var ctx4 = storage.deriveContext({}, "1234-5678", {_type: 'bar'});
	    assert.notEqual(ctx4.originator, ctx1.originator);
	}));
    });
    describe('.storeNewObject(ctx, obj)', function(){
	it('should invoke the .store() method of the corresponding bucket object ', asyncgen.async(function*(){
	    var called = false;
	    var theObjectToCreate = {_type: 'obj', x: 42};
	    function createBucket() {
		return {
		    store: function(obj) {
			called = true;
			assert.deepEqual(obj, theObjectToCreate);
			return 'foo';
		    },
		};
	    }
	    var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	    var id = yield* storage.storeNewObject({bucket: 'abcd'}, theObjectToCreate);
	    assert(called, 'should have been called');
	    assert.equal(id, 'abcd-foo');
	}));
	it('should store the object under a new bucket if the bucket size has been exceeded', asyncgen.async(function*(){
	    var added = [];
	    function createBucket() {
		return {
		    store: function(obj, emit) {
			emit({a:1});
			return '3333';
		    },
		    storeIncoming: function(v, p, monitor, r, eff, emit) {
			emit({foo:'bar'});
		    },
		    storeOutgoing: function(v, p, monitor, r, eff, emit) {},
		    add: function(elem) {
			added.push(elem);
		    },
		    retrieve: function() {
			return new vercast.ObjectMonitor({_type: 'someObj'});
		    },
		};
	    }
	    var storage = new vercast.BucketObjectStorage(bucketStore, createBucket, {maxBucketSize: 5});
	    var monitor = new vercast.ObjectMonitor({_type: 'someObj'});
	    var v1 = '1234-5678';
	    var p = {_type: 'somePatch'};
	    var ctx = storage.deriveContext({}, v1, p);
	    for(let i = 0; i < 5; i++) {
		yield* storage.storeVersion({}, v1, p, monitor, undefined, '');
	    }
	    added = [];
	    var res = yield* storage.storeNewObject(ctx, {_type: 'someOtherObject'});
	    assert.notEqual(res.split('-')[0], ctx.bucket);
	    // Emitions by store() should go to the new bucket
	    assert.deepEqual(yield* bucketStore.retrieve(res.split('-')[0]), [{a:1}]);
	}));
    });
    describe('.storeVersion(ctx, v1, p, monitor, r, eff)', function(){
	it('should invoke the bucket\'s storeInternal() if the context bucket id matches the one in v1', asyncgen.async(function*(){
	    var called = false;
	    function createBucket() {
		return {
		    storeInternal: function(v1, p, monitor, r, eff) {
			called = true;
			assert.equal(v1, '1234-5678');
			assert.equal(p._type, 'somePatch');
			assert.equal(monitor.proxy()._type, 'someObj');
			assert.equal(r, 123);
			assert.equal(eff, 'someEff');
			return 'zyx';
		    },
		};
	    }
	    var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	    var ctx = {bucket: '1234', tuid: 'xxxyyy'};
	    var monitor = new vercast.ObjectMonitor({_type: 'someObj'});
	    var v2 = yield* storage.storeVersion(ctx, '1234-5678', {_type: 'somePatch'}, monitor, 123, 'someEff');
	    assert(called, 'storeInternal() should have been called');
	    assert.equal(v2, '1234-zyx');
	}));
	it('should invoke the storeIncoming() and storeOutgoing() methods of the corresponding two buckets if the call is made from one bucket to another ', 
	   asyncgen.async(function*(){
	       var calledIncoming = false, calledOutgoing = false;
	       function createBucket() {
		   return {
		       storeIncoming: function(v1, p, monitor, r, eff) {
			   calledIncoming = true;
			   assert.equal(v1, '2345-6789');
			   assert.equal(p._type, 'somePatch');
			   assert.equal(monitor.proxy()._type, 'someObj');
			   assert.equal(r, 123);
			   assert.equal(eff, 'someEff');
			   assert.equal(this.this_is, '2345');
			   return "foo";
		       },
		       storeOutgoing: function(v1, p, monitor, r, eff) {
			   calledOutgoing = true;
			   assert.equal(v1, '2345-6789');
			   assert.equal(p._type, 'somePatch');
			   assert.equal(monitor.proxy()._type, 'someObj');
			   assert.equal(r, 123);
			   assert.equal(eff, 'someEff');
			   assert.equal(this.this_is, '1234');
			   return "bar";
		       },
		       storeInternal: function() {
			   assert(false, 'storeInternal() should not have been called');
		       },
		       add: function(elem) {
			   this.this_is = elem.this_is;
		       },
		   };
	       }
	       var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	       var ctx = {bucket: '1234', tuid: 'xxxyyy'};
	       yield* bucketStore.append('1234', [{this_is: '1234'}]);
	       yield* bucketStore.append('2345', [{this_is: '2345'}]);
	       var monitor = new vercast.ObjectMonitor({_type: 'someObj'});
	       var v2 = yield* storage.storeVersion(ctx, '2345-6789', {_type: 'somePatch'}, monitor, 123, 'someEff');
	       assert(calledIncoming, 'storeIncoming() should have been called');
	       assert(calledOutgoing, 'storeOutgoing() should have been called');
	       assert.equal(v2, "2345-foo");
	   }));
	it('should store the object under a new bucket if the bucket size has been exceeded', asyncgen.async(function*(){
	    function createBucket() {
		var index = 0;
		var kvs = Object.create(null);
		return {
		    storeIncoming: function(v, p, monitor, r, eff, emit) {
			emit({a:1});
			return 'foo';
		    },
		    storeOutgoing: function(v, p, monitor, r, eff, emit) {},
		    add: function(elem) {
			if(elem.obj) {
			    kvs[elem.i] = elem.obj;
			}
		    },
		    store: function(obj, emit) {
			index += 1;
			emit({i: index, obj: obj});
			kvs[index] = obj;
			return index;
		    },
		    retrieve: function(v) {
			if(v === 'foo') {
			    return new vercast.ObjectMonitor({_type: 'someObj'});
			}
			var obj = kvs[v];
			if(obj) {
			    return new vercast.ObjectMonitor(obj);
			} else {
			    throw Error('Could not find object for key ' + v);
			}
		    },
		};
	    }
	    var storage = new vercast.BucketObjectStorage(bucketStore, createBucket, {maxBucketSize: 5});
	    var monitor = new vercast.ObjectMonitor({_type: 'someObj'});
	    var v1 = '1234-5678';
	    var p = {_type: 'somePatch'};
	    var ctx = storage.deriveContext({}, v1, p);
	    for(let i = 0; i < 5; i++) {
		yield* storage.storeVersion({}, v1, p, monitor, undefined, '');
	    }
	    var v2 = yield* storage.storeVersion({}, v1, p, monitor, undefined, '');
	    assert.notEqual(v2.split('-')[0], ctx.bucket);
	    // The object must be reachable
	    assert.equal(typeof (yield* storage.retrieve({}, v2)).proxy, 'function');
	    assert.equal((yield* storage.retrieve({}, v2)).proxy()._type, 'someObj');
	}));
	it('should recursively copy all reachable objects in the current bucket to the new one', asyncgen.async(function*(){
	    function createBucket() {
		var index = 0;
		var kvs = Object.create(null);
		return {
		    storeIncoming: function(v, p, monitor, r, eff, emit) {
			index += 1;
			emit({i: index, obj: monitor.object()});
			kvs[index] = monitor.object();
			return index;
		    },
		    storeOutgoing: function(v, p, monitor, r, eff, emit) {},
		    add: function(elem) {
			if(elem.obj) {
			    kvs[elem.i] = elem.obj;
			}
		    },
		    store: function(obj, emit) {
			index += 1;
			emit({i: index, obj: obj});
			kvs[index] = obj;
			return index;
		    },
		    retrieve: function(v) {
			var obj = kvs[v];
			if(obj) {
			    return new vercast.ObjectMonitor(obj);
			} else {
			    throw Error('Could not find object for key ' + v);
			}
		    },
		};
	    }
	    var storage = new vercast.BucketObjectStorage(bucketStore, createBucket, {maxBucketSize: 5});
	    var ctx = storage.deriveContext({}, '1234-5678', {_type: 'somePatch'});
	    var last = yield* storage.storeNewObject(ctx, {_type: 'someObj'});
	    for(let i = 0; i < 2; i++) {
		last = yield* storage.storeNewObject(ctx, {_type: 'someObj', 
							   next: {$:last}, 
							   someNull: null});
	    }
	    var v = yield* storage.storeVersion({}, '1234-5678', {_type: 'somePatch'}, new vercast.ObjectMonitor({_type: 'someObj', next: {$:last}}), undefined, '');
	    assert.equal(last.split('-')[0], '1234');
	    // The next change should create a new bucket
	    v = yield* storage.storeVersion({}, v, {_type: 'somePatch'}, new vercast.ObjectMonitor({_type: 'someObj', next: {$:last}, foo: 2}), undefined, '');
	    var monitor = yield* storage.retrieve({}, v);
	    for(let i = 0; i < 3; i++) {
		assert.notEqual(v.split('-')[0], '1234');
		assert.equal(monitor.proxy()._type, 'someObj');
		v = monitor.proxy().next.$;
		monitor = yield* storage.retrieve({}, v);
	    }
	}));

    });
    describe('.retrieve(ctx, id)', function(){
	it('should invoke the bucket\'s retrieve() method and return the monitor provided by it', asyncgen.async(function*(){
	    function createBucket() {
		return {
		    retrieve: function(id) {
			return new vercast.ObjectMonitor({my_id_is: id});
		    },
		};
	    }
	    var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	    var ctx = {bucket: '4444'};
	    var monitor = yield* storage.retrieve(ctx, "1234-5678");
	    assert.equal(monitor.proxy().my_id_is, '5678');
	}));
	it('should re-consult the bucketStore for updates in case of a missing element', asyncgen.async(function*(){
	    function createBucket() {
		var kvs = {};
		return {
		    add: function(elem) {
			if(elem.id in kvs) {
			    throw Error('Double update of id ' + elem.id);
			}
			kvs[elem.id] = elem.obj;
		    },
		    retrieve: function(id) {
			var val = kvs[id];
			if(!val) {
			    throw Error('Invalid ID ' + id);
			}
			return new vercast.ObjectMonitor(val);
		    },
		};
	    }
	    var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	    var ctx = {bucket: '4444'};
	    yield* bucketStore.append('1234', [{id: '5678', obj: {my_id_is: '5678'}}]);
	    var monitor = yield* storage.retrieve(ctx, "1234-5678");
	    assert.equal(monitor.proxy().my_id_is, '5678');

	    yield* bucketStore.append('1234', [{id: '6789', obj: {my_id_is: '6789'}}]);
	    var monitor = yield* storage.retrieve(ctx, "1234-6789");
	    assert.equal(monitor.proxy().my_id_is, '6789');
	}));

    });
    describe('.checkCache(ctx, v, p)', function(){
	it('should invoke the bucket object\'s checkCache() method', asyncgen.async(function*(){
	    function createBucket() {
		return {
		    checkCache: function(v, p) {
			return {v: v, r: p, eff: 'someEff'};
		    },
		};
	    }
	    var storage = new vercast.BucketObjectStorage(bucketStore, createBucket);
	    var ctx = {bucket: '4444'};
	    var result = yield* storage.checkCache(ctx, '4444-2222', {_type: 'somePatch'});
	    assert.equal(result.v, '4444-2222');
	    assert.equal(result.r._type, 'somePatch');
	}));
    });
});
