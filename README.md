# TOC
   - [BinTree](#bintree)
     - [init](#bintree-init)
     - [fetch](#bintree-fetch)
     - [add](#bintree-add)
     - [getMin](#bintree-getmin)
     - [remove](#bintree-remove)
   - [BucketObjectStore](#bucketobjectstore)
     - [as ObjectStore](#bucketobjectstore-as-objectstore)
       - [.init(ctx, className, args)](#bucketobjectstore-as-objectstore-initctx-classname-args)
       - [.trans(ctx, v1, p)](#bucketobjectstore-as-objectstore-transctx-v1-p)
       - [context](#bucketobjectstore-as-objectstore-context)
   - [counter](#counter)
     - [init](#counter-init)
     - [add](#counter-add)
     - [get](#counter-get)
   - [DummyBucketStore](#dummybucketstore)
   - [DummyObjectStore](#dummyobjectstore)
     - [as ObjectStore](#dummyobjectstore-as-objectstore)
       - [.init(ctx, className, args)](#dummyobjectstore-as-objectstore-initctx-classname-args)
       - [.trans(ctx, v1, p)](#dummyobjectstore-as-objectstore-transctx-v1-p)
       - [context](#dummyobjectstore-as-objectstore-context)
   - [ObjectDisp](#objectdisp)
     - [.init(ctx, className, args)](#objectdisp-initctx-classname-args)
     - [.apply(ctx, obj, patch, unapply)](#objectdisp-applyctx-obj-patch-unapply)
   - [Scheduler](#scheduler)
   - [SimpleCache](#simplecache)
     - [.store(id, obj[, json])](#simplecache-storeid-obj-json)
     - [.fetch(id)](#simplecache-fetchid)
     - [.abolish()](#simplecache-abolish)
     - [.waitFor(keys, callback)](#simplecache-waitforkeys-callback)
   - [vercast](#vercast)
     - [.hash(obj)](#vercast-hashobj)
<a name=""></a>
 
<a name="bintree"></a>
# BinTree
<a name="bintree-init"></a>
## init
should initialize a binary tree with a single element.

```js
var tree = disp.init({}, 'BinTree', {key: 'foo', value: 'bar'});
assert.equal(tree.key, 'foo');
assert.equal(tree.value, 'bar');
assert.equal(tree.left, null);
assert.equal(tree.right, null);
done();
```

<a name="bintree-fetch"></a>
## fetch
should return the value associated with a key.

```js
var v = ostore.init({}, 'BinTree', {key: 'foo', value: 'bar'});
var pair = ostore.trans({}, v, {_type: 'fetch', key: 'foo'});
assert.equal(pair[1], 'bar');
done();
```

should return undefined if the key is not in the tree.

```js
var v = ostore.init({}, 'BinTree', {key: 'foo', value: 'bar'});
var pair = ostore.trans({}, v, {_type: 'fetch', key: 'FOO'});
assert.equal(typeof pair[1], 'undefined');
done();
```

<a name="bintree-add"></a>
## add
should add a leaf to the tree, based on key comparison.

```js
var v = ostore.init({}, 'BinTree', {key: 'foo', value: 'bar'});
v = ostore.trans({}, v, {_type: 'add', key: 'bar', value: 'baz'})[0];
v = ostore.trans({}, v, {_type: 'add', key: 'kar', value: 'fuzz'})[0];
assert.equal(ostore.trans({}, v, {_type: 'fetch', key: 'foo'})[1], 'bar');
assert.equal(ostore.trans({}, v, {_type: 'fetch', key: 'bar'})[1], 'baz');
assert.equal(ostore.trans({}, v, {_type: 'fetch', key: 'kar'})[1], 'fuzz');
done();
```

should report a conflict and not change the state if the the key already exists.

```js
var conflicting = false;
var ctx = {
		conflict: function() { conflicting = true; }
};
var v0 = ostore.init(ctx, 'BinTree', {key: 'foo', value: 'bar'});
var v1 = ostore.trans(ctx, v0, {_type: 'add', key: 'foo', value: 'baz'})[0];
assert(conflicting, 'Should be conflicting');
assert.equal(v0.$, v1.$);
done();
```

<a name="bintree-getmin"></a>
## getMin
should retrieve the the minimum key, with its associated value.

```js
function createTree(list) {
		var v = ostore.init({}, 'BinTree', {key: list[0][0], value: list[0][1]});
		for(var i = 1; i < list.length; i++) {
		    v = ostore.trans({}, v, {_type: 'add', key: list[i][0], value: list[i][1]})[0];
		}
		return v;
}

var v = createTree([[4, 8], [2, 4], [5, 10], [3, 6]]);
var r = ostore.trans({}, v, {_type: 'getMin'})[1];
assert.equal(r.key, 2);
assert.equal(r.value, 4);
done();
```

<a name="bintree-remove"></a>
## remove
should remove the element with the given key and value.

```js
function allInTree(v, list) {
		for(var i = 0; i < list.length; i++) {
		    if(!ostore.trans({}, v, {_type: 'fetch', key: list[i]})[1]) return false;
		}
		return true;
}
// Remove a node that has one child
var v = createTree([[4, 8], [2, 4], [5, 10], [3, 6]]);
var removed2 = ostore.trans({}, v, {_type: 'remove', key: 2, value: 4})[0];
var r = ostore.trans({}, removed2, {_type: 'fetch', key: 2})[1];
assert(!r, 'key 2 should be removed');
assert(allInTree(removed2, [4, 5, 3]), '4, 5, and 3 should remain in the tree');
// Remove a node with two children
var removed4 = ostore.trans({}, v, {_type: 'remove', key: 4, value: 8})[0];
var r = ostore.trans({}, removed4, {_type: 'fetch', key: 4})[1];
assert(!r, 'key 4 should be removed');
assert(allInTree(removed4, [2, 5, 3]), '2, 5, and 3 should remain in the tree');
done();
```

<a name="bucketobjectstore"></a>
# BucketObjectStore
<a name="bucketobjectstore-as-objectstore"></a>
## as ObjectStore
<a name="bucketobjectstore-as-objectstore-initctx-classname-args"></a>
### .init(ctx, className, args)
<a name="bucketobjectstore-as-objectstore-transctx-v1-p"></a>
### .trans(ctx, v1, p)
<a name="bucketobjectstore-as-objectstore-context"></a>
### context
<a name="counter"></a>
# counter
<a name="counter-init"></a>
## init
should create a counter with value = 0.

```js
var initial = disp.init({}, 'counter', {});
assert.equal(initial.value, 0);
done();
```

<a name="counter-add"></a>
## add
should add the given ammount to the counter value.

```js
var c = disp.init({}, 'counter', {});
c = disp.apply({}, c, {_type: 'add', amount: 2})[0];
assert.equal(c.value, 2);
done();
```

should subtract the given amount when unapplied.

```js
var c = disp.init({}, 'counter', {});
c = disp.apply({}, c, {_type: 'add', amount: 2}, -1)[0];
assert.equal(c.value, -2);
done();
```

<a name="counter-get"></a>
## get
should return the counter value.

```js
var c = disp.init({}, 'counter', {});
c = disp.apply({}, c, {_type: 'add', amount: 2})[0];
res = disp.apply({}, c, {_type: 'get'})[1];
assert.equal(res, 2);
done();
```

<a name="dummybucketstore"></a>
# DummyBucketStore
should accumulate all added items and replay them when fetched.

```js
var values = {one: 1, two: 2, three: 3};
for(var key in values) {
    bucketStore.add('myBucket', {key: key, value: values[key]});
}
bucketStore.fetch('myBucket', function(err, bucket) {
    for(var i = 0; i < bucket.length; i++) {
	assert(bucket[i].key in values, 'the  bucket should only contain the added keys');
	delete values[bucket[i].key];
    }
    for(var k in values) assert(false, 'all values should have been removed');
    done();
});
```

should store each bucket individually.

```js
var values = {one: 1, two: 2, three: 3};
for(var key in values) {
    bucketStore.add('myBucket', {key: key, value: values[key]});
    bucketStore.add('myOtherBucket', {key: 'other_' + key, value: values[key] + 2});
}
bucketStore.fetch('myBucket', function(err, bucket) {
    for(var i = 0; i < bucket.length; i++) {
	assert(bucket[i].key in values, 'item ' + JSON.stringify(bucket[i]) + ' should not be in bucket');
    }
    done();
});
```

<a name="dummyobjectstore"></a>
# DummyObjectStore
<a name="dummyobjectstore-as-objectstore"></a>
## as ObjectStore
<a name="dummyobjectstore-as-objectstore-initctx-classname-args"></a>
### .init(ctx, className, args)
should call the init() method of the relevant class with args as a parameter.

```js
var called = false;
var disp = new ObjectDisp({
    MyClass: {
	init: function(ctx, args) {
	    assert.equal(args.foo, 2);
	    called = true;
	}
    }
});
var ostore = new DummyObjectStore(disp);
ostore.init('bar', 'MyClass', {foo: 2});
assert(called, 'MyClass.init() should have been called');
done();
```

should return an ID (an object with a "$" attribute containing a string) of the newly created object.

```js
var id = ostore.init({}, 'Counter', {});
assert.equal(typeof id.$, 'string');
done();
```

<a name="dummyobjectstore-as-objectstore-transctx-v1-p"></a>
### .trans(ctx, v1, p)
should apply patch p to version v1 (v1 is a version ID), returning pair [v2, res] where v2 is the new version ID, and res is the result.

```js
var v0 = ostore.init({}, 'Counter', {});
var pair = ostore.trans({}, v0, {_type: 'add', amount: 10});
var v1 = pair[0];
pair = ostore.trans({}, v1, {_type: 'get'});
var res = pair[1];
assert.equal(res, 10);
done();
```

should replace the object if a _replaceWith field is added to the object.

```js
var ctx = {};
var v = ostore.init(ctx, 'MyClass', {});
var rep = ostore.init(ctx, 'Counter', {});
v = ostore.trans(ctx, v, {_type: 'patch1', rep: rep})[0];
v = ostore.trans(ctx, v, {_type: 'add', amount: 5})[0];
var r = ostore.trans(ctx, v, {_type: 'get'})[1];
assert.equal(r, 5);
done();
```

<a name="dummyobjectstore-as-objectstore-context"></a>
### context
should allow underlying initializations and transitions to perform initializations and transitions.

```js
var disp = new ObjectDisp({
    MyClass: {
	init: function(ctx, args) {
	    this.counter = ctx.init('Counter', {});
	},
	patchCounter: function(ctx, p) {
	    var pair = ctx.transQuery(this.counter, p.p)
	    this.counter = pair[0];
	    return pair[1];
	},
    },
    Counter: require('../counter.js'),
});
var ostore = new DummyObjectStore(disp);
var v = ostore.init({}, 'MyClass', {});
v = ostore.trans({}, v, {_type: 'patchCounter', p: {_type: 'add', amount: 5}})[0];
r = ostore.trans({}, v, {_type: 'patchCounter', p: {_type: 'get'}})[1];
assert.equal(r, 5);
done();
```

<a name="objectdisp"></a>
# ObjectDisp
<a name="objectdisp-initctx-classname-args"></a>
## .init(ctx, className, args)
should call the init() function associated with the class.

```js
var called = false;
disp = {
		'MyClass': {init: function() { called = true; }}
}
objDisp = new ObjectDisp(disp);
objDisp.init({}, 'MyClass', {});
assert(called, 'Function should have been called');
done();
```

should throw an exception if the class does not exist.

```js
var objDisp = new ObjectDisp({});
try {
		objDisp.init({}, 'MyClass', {});
		assert(false, 'Exception should have been thrown');
} catch(e) {
		assert.equal(e.message, "Class MyClass not defined");
}
done();
```

should pass the given context and args to the class's init() function.

```js
var called = false;
disp = {
		'MyClass': {init: function(ctx, args) {
		    assert.equal(ctx, 'foo');
		    assert.equal(args, 'bar');
		    called = true; 
		}}
}
objDisp = new ObjectDisp(disp);
objDisp.init('foo', 'MyClass', 'bar');
assert(called, 'Function should have been called');
done();
```

should return the value of the "this" object in the context of the class's init() function.

```js
disp = {
		'MyClass': {init: function(ctx, args) { this.name = "foobar" }}
}
objDisp = new ObjectDisp(disp);
var ret = objDisp.init({}, 'MyClass', {});
assert.equal(ret.name, 'foobar');
done();
```

should add a _type field to the returned object, containing the class name.

```js
disp = {
		'MyClass': {init: function(ctx, args) { this.name = 'foobar'; }}
}
objDisp = new ObjectDisp(disp);
var ret = objDisp.init({}, 'MyClass', {});
assert.equal(ret._type, 'MyClass');
done();
```

<a name="objectdisp-applyctx-obj-patch-unapply"></a>
## .apply(ctx, obj, patch, unapply)
should call the function with name matches the _type field of the patch, in the class associated with the object..

```js
var called = false;
disp = {
		'MyClass': {
		    init: function() {},
		    patch1: function () { called = true; },
		}
}
objDisp = new ObjectDisp(disp);
var ctx = {};
var obj = objDisp.init(ctx, 'MyClass', {});
objDisp.apply(ctx, obj, {_type: 'patch1'});
assert(called, 'Function should have been called');
done();
```

should throw an exception if the patch function is not defined.

```js
var called = false;
disp = {
		'MyClass': {
		    init: function() {},
		    patch1: function () { called = true; },
		}
}
objDisp = new ObjectDisp(disp);
var ctx = {};
var obj = objDisp.init(ctx, 'MyClass', {});
try {
		objDisp.apply(ctx, obj, {_type: 'patch2'});
		assert(false, 'Exception should have been raised');
} catch(e) {
		assert.equal(e.message, 'Patch method patch2 is not defined in class MyClass');
}
done();
```

should pass the object as the "this" parameter to the patch function.

```js
var called = false;
disp = {
		'MyClass': {
		    init: function() { this.name = 'foo'; },
		    patch1: function () {
			assert.equal(this.name, 'foo');
			called = true;
		    },
		}
}
objDisp = new ObjectDisp(disp);
var ctx = {};
var obj = objDisp.init(ctx, 'MyClass', {});
objDisp.apply(ctx, obj, {_type: 'patch1'});
assert(called, 'Function should have been called');
done();
```

should pass the context, the patch and the unapply flag as parameters to the patch function.

```js
disp = {
		'MyClass': {
		    init: function() { },
		    patch1: function (ctx, patch, unapply) {
			assert.equal(ctx.foo, 'bar');
			assert.equal(patch.bar, 'baz');
			assert(unapply, 'The unapply flag should have been set');
		    },
		}
}
objDisp = new ObjectDisp(disp);
var ctx = {foo: 'bar'};
var obj = objDisp.init(ctx, 'MyClass', {});
objDisp.apply(ctx, obj, {_type: 'patch1', bar: 'baz'}, true);
done();
```

should return a pair [obj, res], containing the patch function's "this" object, and its return value.

```js
disp = {
		'MyClass': {
		    init: function() { this.name = 'foo'; },
		    patch1: function (ctx, patch) {
			var old = this.name;
			this.name = patch.name;
			return old;
		    },
		}
}
objDisp = new ObjectDisp(disp);
var ctx = {};
var obj = objDisp.init(ctx, 'MyClass', {});
res = objDisp.apply(ctx, obj, {_type: 'patch1', name: 'bar'});
assert.equal(res[0].name, 'bar');
assert.equal(res[1], 'foo');
done();
```

should use patch handlers if defined (prfixed with ":").

```js
var called = false;
disp = {
		'MyClass': {
		    init: function() { this.name = 'foo'; },
		    get: function(ctx, patch) {
			return this.name;
		    },
		},
		':patch1': function(ctx, obj, patch) {
		    called = true;
		    // We get the patch from the caller
		    assert.equal(patch.name, 'bar');
		    // and the object
		    assert.equal(obj.name, 'foo');
		    // "this" is the object dispatcher
		    var pair = this.apply(ctx, obj, {_type: 'get'});
		    assert(pair[1], 'foo');
		    
		    obj.name = 'bazz';
		    return 2;
		},
}
objDisp = new ObjectDisp(disp);
var ctx = {};
var obj = objDisp.init(ctx, 'MyClass', {});
res = objDisp.apply(ctx, obj, {_type: 'patch1', name: 'bar'});
assert(called, 'patch function should have been called');
assert.equal(res[0].name, 'bazz');
assert.equal(res[1], 2);
done();
```

should prefer a method defined in a class over a generic patch function if both are defined.

```js
var called = false;
disp = {
		'MyClass': {
		    init: function() { this.name = 'foo'; },
		    patch1: function() {
			called = true;
		    },
		    get: function(ctx, patch) {
			return this.name;
		    },
		},
		':patch1': function(ctx, obj, patch) {
		    assert(false, 'Patch function should not have been called');
		},
}
objDisp = new ObjectDisp(disp);
var ctx = {};
var obj = objDisp.init(ctx, 'MyClass', {});
res = objDisp.apply(ctx, obj, {_type: 'patch1'});
assert(called, 'patch function should have been called');
done();
```

<a name="scheduler"></a>
# Scheduler
allows users to register a callback to a condition. Once the condition is met, the callback is called.

```js
var sched = new Scheduler();
var called = false;
sched.register(['foo'], function() {
    called = true;
});
assert(!called, 'Callback should not have been called yet');
sched.notify('foo');
assert(called, 'Callback should have been called');
done();
```

should not call a callback unless the condition has been met.

```js
var sched = new Scheduler();
var called = false;
sched.register(['foo'], function() {
    called = true;
});
assert(!called, 'Callback should not have been called yet');
sched.notify('bar');
assert(!called, 'Callback should not have been called');
done();
```

should allow multiple registrations on the same condition.

```js
var sched = new Scheduler();
var called1 = false;
sched.register(['foo'], function() {
    called1 = true;
});
var called2 = false;
sched.register(['foo'], function() {
    called2 = true;
});
var called3 = false;
sched.register(['foo'], function() {
    called3 = true;
});
assert(!called1, 'Callback 1 should not have been called yet');
assert(!called2, 'Callback 2 should not have been called yet');
assert(!called3, 'Callback 3 should not have been called yet');
sched.notify('foo');
assert(called1, 'Callback 1 should have been called');
assert(called2, 'Callback 1 should have been called');
assert(called3, 'Callback 1 should have been called');
done();
```

should call each callback only once even if notified multiple times.

```js
var sched = new Scheduler();
var called = false;
sched.register(['foo'], function() {
    assert(!called, 'Callback should have been called only once');
    called = true;
});
sched.notify('foo');
sched.notify('foo');
sched.notify('foo');
sched.notify('foo');
done();
```

should call a callback only when all conditions are met.

```js
var sched = new Scheduler();
var called = false;
sched.register(['foo', 'bar', 'baz', 'bat'], function() {
    called = true;
});
sched.notify('bar');
sched.notify('foo');
sched.notify('bat');
assert(!called, 'Callback should not have been called yet');
sched.notify('baz');
assert(called, 'Callback should have been called');
done();
```

<a name="simplecache"></a>
# SimpleCache
<a name="simplecache-storeid-obj-json"></a>
## .store(id, obj[, json])
should store an object in the cache under the given ID.

```js
var cache = new SimpleCache();
cache.store('one', {value: 1});
cache.store('two', {value: 2});
cache.store('three', {value: 3});
assert.equal(cache.fetch('one').value, 1);
assert.equal(cache.fetch('two').value, 2);
assert.equal(cache.fetch('three').value, 3);
done();
```

should retrieve the same instance on a first fetch.

```js
var cache = new SimpleCache();
var one = {value: 1};
cache.store('one', one);
one.value = 2;
assert.equal(cache.fetch('one').value, 2);
done();
```

should retrieve the same object once and again, even if it was modified on the outside.

```js
var cache = new SimpleCache();
cache.store('one', {value: 1});
var one = cache.fetch('one');
one.value = 2;
assert.equal(cache.fetch('one').value, 1);
done();
```

should use the json argument, if supplied, as the JSON representation of the object to be used when the instance is no longer available.

```js
var cache = new SimpleCache();
cache.store('one', {value: 1}, JSON.stringify({value: 2}));
assert.equal(cache.fetch('one').value, 1); // first time
assert.equal(cache.fetch('one').value, 2); // second time
assert.equal(cache.fetch('one').value, 2); // third time
done();
```

<a name="simplecache-abolish"></a>
## .abolish()
should remove all elements from the cache.

```js
var cache = new SimpleCache();
cache.store('one', {value: 1});
cache.store('two', {value: 2});
cache.store('three', {value: 3});
cache.abolish();
assert.equal(typeof cache.fetch('one'), 'undefined');
assert.equal(typeof cache.fetch('two'), 'undefined');
assert.equal(typeof cache.fetch('three'), 'undefined');
done();
```

<a name="simplecache-waitforkeys-callback"></a>
## .waitFor(keys, callback)
should call the given callback once all keys are in the cache.

```js
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
```

should throw an exception if one of the keys is already in the cache.

```js
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
```

<a name="vercast"></a>
# vercast
<a name="vercast-hashobj"></a>
## .hash(obj)
should return a SHA-256 digest of the given string.

```js
var str = 'hello, there';
var strHash = vercast.hash(str);

var hash = crypto.createHash('sha256');
hash.update(str);
assert.equal(strHash, hash.digest('base64'));
done();
```

