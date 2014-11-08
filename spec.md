# TOC
   - [DummyObjectStore](#dummyobjectstore)
     - [.init(type, args)](#dummyobjectstore-inittype-args)
     - [.trans(v, p, u, EQ) -> {v, r}](#dummyobjectstore-transv-p-u-eq---v-r)
     - [context](#dummyobjectstore-context)
       - [.init(type, args)](#dummyobjectstore-context-inittype-args)
       - [.trans(v, p, u) -> {v,r}](#dummyobjectstore-context-transv-p-u---vr)
       - [.conflict(msg)](#dummyobjectstore-context-conflictmsg)
       - [.effect(p)](#dummyobjectstore-context-effectp)
   - [ObjectDispatcher](#objectdispatcher)
     - [.init(type, args)](#objectdispatcher-inittype-args)
     - [.apply(ctx, obj, patch, unapply)](#objectdispatcher-applyctx-obj-patch-unapply)
   - [ObjectMonitor](#objectmonitor)
     - [.proxy()](#objectmonitor-proxy)
     - [.isDirty()](#objectmonitor-isdirty)
   - [SimpleQueue](#simplequeue)
<a name=""></a>
 
<a name="dummyobjectstore"></a>
# DummyObjectStore
<a name="dummyobjectstore-inittype-args"></a>
## .init(type, args)
should return a version ID of a newly created object.

```js
function* (done){
	    var called = false;
	    var dispMap = {
		foo: {
		    init: function*() {
			called = true;
		    },
		},
	    };
	    var ostore = createOStore(dispMap);
	    var v = yield* ostore.init('foo', {});
	    assert.equal(typeof v.$, 'string');
	    assert(called, 'The constructor should have been called');
```

<a name="dummyobjectstore-transv-p-u-eq---v-r"></a>
## .trans(v, p, u, EQ) -> {v, r}
should return the value returned from the method corresponding to patch p.

```js
function* (done){
	    var dispMap = {
		foo: {
		    init: function*() {
			this.baz = 0;
		    },
		    bar: function*() {
			yield sleep(1);
			this.baz += 1;
			return this.baz;
		    },
		},
	    };
	    var ostore = createOStore(dispMap);
	    var v = yield* ostore.init('foo', {});
	    var pair = yield* ostore.trans(v, {_type: 'bar'});
	    assert.equal(pair.r, 1);
	    pair = (yield* ostore.trans(pair.v, {_type: 'bar'}));
	    assert.equal(pair.r, 2);
```

should pass the patch and u flag as parameters to the called method.

```js
function* (done){
	    var dispMap = {
		foo: {
		    init: function*() {
			this.baz = 0;
		    },
		    bar: function*(ctx, p, u) {
			var amount = p.amount;
			if(u) amount = -amount;
			this.baz += amount;
			return this.baz;
		    },
		},
	    };
	    var ostore = createOStore(dispMap);
	    var v = yield* ostore.init('foo', {});
	    var pair = yield* ostore.trans(v, {_type: 'bar', amount: 3});
	    assert.equal(pair.r, 3);
	    pair = yield* ostore.trans(pair.v, {_type: 'bar', amount: 2}, true);
	    assert.equal(pair.r, 1);
```

<a name="dummyobjectstore-context"></a>
## context
<a name="dummyobjectstore-context-inittype-args"></a>
### .init(type, args)
should initialize an object with the given type and args and return its version ID.

```js
function* (){
		var dispMap = {
		    creator: {
			init: function*(ctx, args) {},
			create: function*(ctx, p, u) {
			    return yield* ctx.init(p.type, p.args);
			},
		    },
		    foo: {
			init: function*(ctx, args) { this.value = args.value; },
			get: function*() { return this.value; },
		    },
		};
		var ostore = createOStore(dispMap);
		var creator = yield* ostore.init('creator', {});
		var foo1 = yield* ostore.trans(creator, {_type: 'create', type: 'foo', args: {value: 3}});
		var res = yield* ostore.trans(foo1.r, {_type: 'get'});
		assert.equal(res.r, 3);
```

<a name="dummyobjectstore-context-transv-p-u---vr"></a>
### .trans(v, p, u) -> {v,r}
should transform a version and return the new version ID and result.

```js
function* (){
		var dispMap = {
		    foo: {
			init: function*(ctx, args) {
			    this.bar = yield* ctx.init('bar', {});
			},
			add: function*(ctx, p, u) {
			    var pair = yield* ctx.trans(this.bar, p, u);
			    this.bar = pair.v;
			    return pair.r;
			},
		    },
		    bar: {
			init: function*() {
			    this.value = 0;
			},
			add: function*(ctx, p, u) {
			    this.value += (u?-1:1) * p.amount;
			    return this.value;
			},
		    },
		};
		var ostore = createOStore(dispMap);
		var foo = yield* ostore.init('foo', {});
		var pair = yield* ostore.trans(foo, {_type: 'add', amount: 3});
		assert.equal(pair.r, 3);
		pair = yield* ostore.trans(pair.v, {_type: 'add', amount: 2}, true);
		assert.equal(pair.r, 1);
```

<a name="dummyobjectstore-context-conflictmsg"></a>
### .conflict(msg)
should throw an exception with .isConflict set to true.

```js
function* (){
		var dispMap = {
		    foo: {
			init: function*() {},
			raise: function*(ctx, p, u) { ctx.conflict('foo raises a conflict'); },
		    },
		};
		var ostore = createOStore(dispMap);
		var foo = yield* ostore.init('foo', {});
		try {
		    yield* ostore.trans(foo, {_type: 'raise'});
		    assert(false, 'should not be here');
		} catch(e) {
		    if(!e.isConflict) {
			throw e;
		    }
		}
```

<a name="dummyobjectstore-context-effectp"></a>
### .effect(p)
should add patch p to the effect queue.

```js
function* (){
		var dispMap = {
		    foo: {
			init: function*() {},
			eff: function*(ctx, p, u) {
			    yield* ctx.effect(p.patch);
			},
		    },
		};
		var ostore = createOStore(dispMap);
		var foo = yield* ostore.init('foo', {});
		var queue = new vercast.SimpleQueue();
		yield* ostore.trans(foo, {_type: 'eff', patch: 123}, false, queue);
		assert(!(yield* queue.isEmpty()), 'queue should contain an element');
		assert.equal(yield* queue.dequeue(), 123);
```

should add patches to the effect set even when called from a nested transformation.

```js
function* (){
		var dispMap = {
		    foo: {
			init: function*(ctx) { this.bar = yield* ctx.init('bar', {}); },
			eff: function*(ctx, p, u) {
			    this.bar = (yield* ctx.trans(this.bar, p, u)).v;
			},
		    },
		    bar: {
			init: function*() {},
			eff: function*(ctx, p, u) {
			    yield* ctx.effect(p.patch);
			},
		    },
		};
		var ostore = createOStore(dispMap);
		var foo = yield* ostore.init('foo', {});
		var queue = new vercast.SimpleQueue();
		yield* ostore.trans(foo, {_type: 'eff', patch: 123}, false, queue);
		assert.equal(yield* queue.dequeue(), 123);
```

<a name="objectdispatcher"></a>
# ObjectDispatcher
<a name="objectdispatcher-inittype-args"></a>
## .init(type, args)
should return an instance of the referenced type, after calling the init() function associated with the type.

```js
function* (){
	    var disp = new vercast.ObjectDispatcher({foo: {
		init: function*(ctx, args) {
		    this.bar = 2;
		    this.ctx = ctx;
		    this.baz = args.baz;
		}
	    }
						    });
	    var ctx = 777;
	    var obj = yield* disp.init(ctx, 'foo', {baz: 123});
	    assert.equal(obj._type, 'foo');
	    assert.equal(obj.bar, 2);
	    assert.equal(obj.ctx, ctx);
	    assert.equal(obj.baz, 123);
```

<a name="objectdispatcher-applyctx-obj-patch-unapply"></a>
## .apply(ctx, obj, patch, unapply)
should call a method corresponding to patch._type.

```js
function* (done){
	    var disp = new vercast.ObjectDispatcher({
		foo: {
		    init: function*(ctx, args) {},
		    bar: function*() {this.bar = 2;
				      return ctx + 1;},
		}
	    });
	    var ctx = 777;
	    var obj = yield* disp.init(ctx, 'foo');
	    var res = yield* disp.apply(ctx, obj, {_type: 'bar'});
	    assert.equal(obj.bar, 2);
	    assert.equal(res, 778);
```

<a name="objectmonitor"></a>
# ObjectMonitor
<a name="objectmonitor-proxy"></a>
## .proxy()
should allow modifying an object through a proxy.

```js
var obj = {a:1, b:2};
var monitor = new vercast.ObjectMonitor(obj);
var proxy = monitor.proxy();
assert.equal(proxy.a, 1);
proxy.a = 3;
assert.equal(obj.a, 3);
```

should wrap objects (including arrays) with map proxies.

```js
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
```

should provide access to child object fields via get/put methods, that update the dirty flag.

```js
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
```

<a name="objectmonitor-isdirty"></a>
## .isDirty()
should indicate if a change to the object has been made since the last time it has been called.

```js
var obj = {a:1, b:2};
var monitor = new vercast.ObjectMonitor(obj);
var proxy = monitor.proxy();
assert(!monitor.isDirty(), 'monitor should not be dirty yet');
proxy.a = 3;
assert(monitor.isDirty(), 'monitor should now be dirty');
assert(!monitor.isDirty(), 'monitor should not be dirty anymore');
```

<a name="simplequeue"></a>
# SimpleQueue
should retrieve elements in the same order they were entered.

```js
function* (){
	var queue = new vercast.SimpleQueue();
	var i;
	for(i = 0; i < 10; i++) {
	    yield* queue.enqueue(i);
	}
	for(i = 0; i < 10; i++) {
	    assert(!(yield* queue.isEmpty()), 'queue should not be empty yet');
	    var n = yield* queue.dequeue();
	    assert.equal(n, i);
	}
	assert(yield* queue.isEmpty(), 'queue should be empty');
```

