# TOC
   - [DummyKeyValueStore](#dummykeyvaluestore)
   - [DummyObjectStore](#dummyobjectstore)
     - [.init(type, args)](#dummyobjectstore-inittype-args)
     - [.trans(v, p, u, EQ) -> {v, r}](#dummyobjectstore-transv-p-u-eq---v-r)
     - [context](#dummyobjectstore-context)
       - [.init(type, args)](#dummyobjectstore-context-inittype-args)
       - [.trans(v, p, u) -> {v,r,eff}](#dummyobjectstore-context-transv-p-u---vreff)
       - [.conflict(msg)](#dummyobjectstore-context-conflictmsg)
       - [.effect(p)](#dummyobjectstore-context-effectp)
   - [ObjectDispatcher](#objectdispatcher)
     - [.init(type, args)](#objectdispatcher-inittype-args)
     - [.apply(ctx, obj, patch, unapply)](#objectdispatcher-applyctx-obj-patch-unapply)
   - [ObjectMonitor](#objectmonitor)
     - [.proxy()](#objectmonitor-proxy)
     - [.isDirty()](#objectmonitor-isdirty)
     - [.hash()](#objectmonitor-hash)
     - [.seal(obj) [static]](#objectmonitor-sealobj-static)
     - [.revision()](#objectmonitor-revision)
   - [RootStore](#rootstore)
     - [.init(type, args)](#rootstore-inittype-args)
     - [.trans(v, p, u) -> {v,r}](#rootstore-transv-p-u---vr)
   - [SequenceStoreFactory](#sequencestorefactory)
     - [.createSequenceStore()](#sequencestorefactory-createsequencestore)
       - [.append(obj)](#sequencestorefactory-createsequencestore-appendobj)
       - [.isEmpty()](#sequencestorefactory-createsequencestore-isempty)
       - [.shift()](#sequencestorefactory-createsequencestore-shift)
       - [.hash()](#sequencestorefactory-createsequencestore-hash)
   - [SimpleObjectStore](#simpleobjectstore)
     - [.init(type, args)](#simpleobjectstore-inittype-args)
     - [.trans(v, p, u, EQ) -> {v, r}](#simpleobjectstore-transv-p-u-eq---v-r)
     - [context](#simpleobjectstore-context)
       - [.init(type, args)](#simpleobjectstore-context-inittype-args)
       - [.trans(v, p, u) -> {v,r,eff}](#simpleobjectstore-context-transv-p-u---vreff)
       - [.conflict(msg)](#simpleobjectstore-context-conflictmsg)
       - [.effect(p)](#simpleobjectstore-context-effectp)
   - [SimpleQueue](#simplequeue)
<a name=""></a>
 
<a name="dummykeyvaluestore"></a>
# DummyKeyValueStore
should retrieve stored values.

```js
function* (){
	var kvs = new vercast.DummyKeyValueStore();
	yield* kvs.store('foo', 'bar');
	assert.equal(yield* kvs.fetch('foo'), 'bar');
```

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

<a name="dummyobjectstore-context-transv-p-u---vreff"></a>
### .trans(v, p, u) -> {v,r,eff}
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
should add patch p to the effect sequence.

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
		var res = yield* ostore.trans(foo, {_type: 'eff', patch: {p:123}}, false);
		var seqStore = ostore.getSequenceStore();
		yield* seqStore.append(res.eff);
		assert(!seqStore.isEmpty(), 'sequence should contain an element');
		assert.deepEqual(yield* seqStore.shift(), {p:123});
```

should add patches to the effect set even when called from a nested transformation.

```js
function* (){
		var dispMap = {
		    foo: {
			init: function*(ctx) { this.bar = yield* ctx.init('bar', {}); },
			eff: function*(ctx, p, u) {
			    yield* ctx.effect({p:333});
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
		var res = yield* ostore.trans(foo, {_type: 'eff', patch: {p:123}}, false);
		var seqStore = ostore.getSequenceStore();
		yield* seqStore.append(res.eff);
		assert.deepEqual(yield* seqStore.shift(), {p:333});
		assert.deepEqual(yield* seqStore.shift(), {p:123});
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
assert.throws(function() {
		proxy.a[0] = 4;
}, /Can't add property 0, object is not extensible/);
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

should retain the original object as a simple, JSON-style object.

```js
var obj = {a:1, b:2};
var monitor = new vercast.ObjectMonitor(obj);
var proxy = monitor.proxy();
proxy.a = [1, 2, 3];
assert.deepEqual(obj, {a:[1, 2, 3], b:2});
proxy.a.put(2, 4);
assert.deepEqual(obj, {a:[1, 2, 4], b:2});
```

should use map proxies recursively.

```js
var obj = {a:1, b:2};
var monitor = new vercast.ObjectMonitor(obj);
var proxy = monitor.proxy();
proxy.a = [1, 2, 3];
proxy.a.put(2, {x:1, y: 2});
assert.throws(function() {
		proxy.a.get(2).x = 3;
}, /Can't add property x, object is not extensible/);
assert.equal(proxy.a.get(2).get('x'), 1);
monitor.isDirty(); // reset the dirty flag
proxy.a.get(2).put('x', 4);
assert(monitor.isDirty(), 'should be dirty now');
assert.equal(proxy.a.get(2).get('x'), 4);
```

should return an unextensible proxy object.

```js
var obj = {a:1, b:2};
var monitor = new vercast.ObjectMonitor(obj);
var proxy = monitor.proxy();
assert.throws(function() {
		proxy.c = 4;
}, /Can't add property c, object is not extensible/);
```

should not provide a map proxy for id-like objects.

```js
var obj = {a:1, b:2};
var monitor = new vercast.ObjectMonitor(obj);
var proxy = monitor.proxy();
proxy.a = {$:'abc'};
assert.equal(proxy.a.$, 'abc');
```

should not provide a map proxy for id-like nested objects.

```js
var obj = {a:1, b:2, c: {$:'abc'}};
var monitor = new vercast.ObjectMonitor(obj);
var proxy = monitor.proxy();
proxy.b = [1, 2, 3];
proxy.b.put(1, {$:'efg'});
assert.equal(proxy.b.get(1).$, 'efg');
assert.equal(proxy.c.$, 'abc');
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

<a name="objectmonitor-hash"></a>
## .hash()
should return a unique string representing the content of the object.

```js
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
```

should work regardless of dirty testing.

```js
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
```

<a name="objectmonitor-sealobj-static"></a>
## .seal(obj) [static]
should make the given object unmodifiable.

```js
var obj = {a:1, b:2};
vercast.ObjectMonitor.seal(obj);
assert.throws(function() {
		obj.a = 3;
}, /Cannot assign to read only property/);
```

should place the object's hash as the $ property of the object.

```js
var hash1 = new vercast.ObjectMonitor({a:1, b:2}).hash();
var obj = {a:1, b:2};
vercast.ObjectMonitor.seal(obj);
assert.equal(obj.$, hash1);
```

should return the hash.

```js
var obj = {a:1, b:2};
var hash1 = vercast.ObjectMonitor.seal(obj);
assert.equal(obj.$, hash1);
```

should allow an object to be sealed multiple times.

```js
var obj = {a:1, b:2};
var hash1 = vercast.ObjectMonitor.seal(obj);
var hash2 = vercast.ObjectMonitor.seal(obj);
assert.equal(hash1, hash2);
```

<a name="objectmonitor-revision"></a>
## .revision()
should return the object's revision number, one that icrements with each change.

```js
var obj = {a:1, b:2};
var monitor = new vercast.ObjectMonitor(obj);
var proxy = monitor.proxy();
assert.equal(monitor.revision(), 0);
proxy.a = [1, 2, 3];
assert.equal(monitor.revision(), 1);
proxy.a.put(0, 3);
assert.equal(monitor.revision(), 2);
```

<a name="rootstore"></a>
# RootStore
<a name="rootstore-inittype-args"></a>
## .init(type, args)
should return an initial version ID of a new object.

```js
function* (){
	    var called = false;
	    var dispMap = {
		foo: {
		    init: function*() { called = true; },
		},
	    };
	    var rootStore = new vercast.RootStore(createOStore(dispMap));
	    var v = yield* rootStore.init('foo', {});
	    assert(called, 'constructor should have been called');
```

<a name="rootstore-transv-p-u---vr"></a>
## .trans(v, p, u) -> {v,r}
should call a patch method and return its returned value.

```js
function* (){
	    var dispMap = {
		counter: {
		    init: function*() { this.value = 0; },
		    add: function*(ctx, p, u) {
			this.value += (u?-1:1) * p.amount;
			return this.value;
		    },
		},
	    };
	    var rootStore = new vercast.RootStore(createOStore(dispMap));
	    var v = yield* rootStore.init('counter', {});
	    var pair = yield* rootStore.trans(v, {_type: 'add', amount: 2});
	    assert.equal(pair.r, 2);
	    pair = yield* rootStore.trans(pair.v, {_type: 'add', amount: 3}, true);
	    assert.equal(pair.r, -1);
```

should apply the effect set internally.

```js
function* (){
	    var dispMap = {
		dir: {
		    init: function*(ctx, args) {
			this.foo = yield* ctx.init('foo', {});
			this.bar = yield* ctx.init('bar', {});
		    },
		    apply: function*(ctx, p, u) {
			var pair = yield* ctx.trans(this[p.name], p.patch, u);
			this[p.name] = pair.v;
			return pair.r;
		    },
		},
		foo: {
		    init: function*() { this.foo = 0; },
		    inc: function*(ctx, p, u) {
			this.foo += (u?-1:1);
			return this.foo;
		    },
		},
		bar: {
		    init: function*() { },
		    incFoo: function*(ctx, p, u) {
			yield* ctx.effect({_type: 'apply', name: 'foo', patch: {_type: 'inc'}});
		    },
		},
	    };
	    var rootStore = new vercast.RootStore(createOStore(dispMap));
	    var v = yield* rootStore.init('dir', {});
	    var pair = yield* rootStore.trans(v, {_type: 'apply', 
						  name: 'bar', 
						  patch: {_type: 'incFoo'}});
	    pair = yield* rootStore.trans(pair.v, {_type: 'apply',
						   name: 'foo',
						   patch: {_type: 'inc'}});
	    assert.equal(pair.r, 2);
```

<a name="sequencestorefactory"></a>
# SequenceStoreFactory
<a name="sequencestorefactory-createsequencestore"></a>
## .createSequenceStore()
should return a new sequence store.

```js
var seqStore = factory.createSequenceStore();
assert.equal(typeof seqStore, 'object');
```

<a name="sequencestorefactory-createsequencestore-appendobj"></a>
### .append(obj)
should append an object to a sequence.

```js
function* (){
		var seqStore = factory.createSequenceStore();
		yield* seqStore.append({a:1});
		yield* seqStore.append({a:2});
```

should append an entire sequence if given its hash.

```js
function* (){
		var seqStore1 = factory.createSequenceStore();
		yield* seqStore1.append({a:1});
		yield* seqStore1.append({a:2});

		var seqStore2 = factory.createSequenceStore();
		yield* seqStore2.append(yield* seqStore1.hash());
		yield* seqStore2.append({a:3});
		
		assert.deepEqual(yield* seqStore2.shift(), {a:1});
		assert.deepEqual(yield* seqStore2.shift(), {a:2});
		assert.deepEqual(yield* seqStore2.shift(), {a:3});
```

should append a sequence consisting of a single object when given its hash.

```js
function* (){
		var seqStore1 = factory.createSequenceStore();
		yield* seqStore1.append({a:2});

		var seqStore2 = factory.createSequenceStore();
		yield* seqStore2.append({a:1});
		yield* seqStore2.append(yield* seqStore1.hash());
		yield* seqStore2.append({a:3});
		
		assert.deepEqual(yield* seqStore2.shift(), {a:1});
		assert.deepEqual(yield* seqStore2.shift(), {a:2});
		assert.deepEqual(yield* seqStore2.shift(), {a:3});
```

<a name="sequencestorefactory-createsequencestore-isempty"></a>
### .isEmpty()
should indicate if the sequence is empty.

```js
function* (){
		var seqStore = factory.createSequenceStore();
		assert(seqStore.isEmpty(), 'should be empty');
		yield* seqStore.append({a:1});
		assert(!seqStore.isEmpty(), 'should not be empty anymore');
```

<a name="sequencestorefactory-createsequencestore-shift"></a>
### .shift()
should remove the first element from the sequence and return it.

```js
function* (){
		var seqStore = factory.createSequenceStore();
		yield* seqStore.append({a:1});
		yield* seqStore.append({a:2});
		assert.deepEqual(yield* seqStore.shift(), {a:1});
		assert.deepEqual(yield* seqStore.shift(), {a:2});
		assert(seqStore.isEmpty());
```

<a name="sequencestorefactory-createsequencestore-hash"></a>
### .hash()
should return an empty string if the sequence is empty.

```js
function* (){
		var seqStore = factory.createSequenceStore();
		assert.equal(yield* seqStore.hash(), '');
```

should return the object hash, assuming only one object in the sequence.

```js
function* (){
		var seqStore = factory.createSequenceStore();
		yield* seqStore.append({a:1});
		assert.equal(yield* seqStore.hash(), vercast.ObjectMonitor.seal({a:1}));
```

should return a hash unique to the sequence for sequence size larger than 1.

```js
function* (){
		var seqStore1 = factory.createSequenceStore();
		yield* seqStore1.append({a:1});
		yield* seqStore1.append({a:2});
		yield* seqStore1.append({a:3});
		var seqStore2 = factory.createSequenceStore();
		yield* seqStore2.append({a:1});
		yield* seqStore2.append({a:2});
		yield* seqStore2.append({a:3});
		assert.equal(yield* seqStore1.hash(), yield* seqStore2.hash());
		var seqStore3 = factory.createSequenceStore();
		yield* seqStore3.append({a:1});
		yield* seqStore3.append({a:2});
		assert.notEqual(yield* seqStore3.hash(), yield* seqStore2.hash());
```

should provide the same hash if the only element in a sequence is a hash of another sequence.

```js
function* (){
		var seqStore1 = factory.createSequenceStore();
		yield* seqStore1.append({a:1});
		yield* seqStore1.append({a:2});
		yield* seqStore1.append({a:3});
		
		var seqStore2 = factory.createSequenceStore();
		yield* seqStore2.append(yield* seqStore1.hash());
		
		assert.equal(yield* seqStore1.hash(), yield* seqStore2.hash());
```

<a name="simpleobjectstore"></a>
# SimpleObjectStore
should avoid running the patch method again if the patch has already been applied on an identical object.

```js
function* (){
	var count = 0;
	var dispMap = {
	    foo: {
		init: function*() { this.x = 0; },
		bar: function*(ctx, p, u) {
		    count += 1;
		    this.x += 1;
		},
	    },
	};
	var ostore = createOStore(dispMap);
	var v0 = yield* ostore.init('foo', {});
	var v1 = (yield* ostore.trans(v0, {_type: 'bar'})).v;
	assert.equal(count, 1);
	var v1Prime = (yield* ostore.trans(v0, {_type: 'bar'})).v;
	assert.equal(v1.$, v1Prime.$);
	// This should not 
	assert.equal(count, 1);
```

<a name="simpleobjectstore-inittype-args"></a>
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

<a name="simpleobjectstore-transv-p-u-eq---v-r"></a>
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

<a name="simpleobjectstore-context"></a>
## context
<a name="simpleobjectstore-context-inittype-args"></a>
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

<a name="simpleobjectstore-context-transv-p-u---vreff"></a>
### .trans(v, p, u) -> {v,r,eff}
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

<a name="simpleobjectstore-context-conflictmsg"></a>
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

<a name="simpleobjectstore-context-effectp"></a>
### .effect(p)
should add patch p to the effect sequence.

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
		var res = yield* ostore.trans(foo, {_type: 'eff', patch: {p:123}}, false);
		var seqStore = ostore.getSequenceStore();
		yield* seqStore.append(res.eff);
		assert(!seqStore.isEmpty(), 'sequence should contain an element');
		assert.deepEqual(yield* seqStore.shift(), {p:123});
```

should add patches to the effect set even when called from a nested transformation.

```js
function* (){
		var dispMap = {
		    foo: {
			init: function*(ctx) { this.bar = yield* ctx.init('bar', {}); },
			eff: function*(ctx, p, u) {
			    yield* ctx.effect({p:333});
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
		var res = yield* ostore.trans(foo, {_type: 'eff', patch: {p:123}}, false);
		var seqStore = ostore.getSequenceStore();
		yield* seqStore.append(res.eff);
		assert.deepEqual(yield* seqStore.shift(), {p:333});
		assert.deepEqual(yield* seqStore.shift(), {p:123});
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

