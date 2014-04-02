# TOC
   - [BinTree](#bintree)
     - [init](#bintree-init)
     - [fetch](#bintree-fetch)
     - [add](#bintree-add)
   - [counter](#counter)
     - [init](#counter-init)
     - [add](#counter-add)
     - [get](#counter-get)
   - [DummyObjectStore](#dummyobjectstore)
     - [.init(ctx, className, args)](#dummyobjectstore-initctx-classname-args)
     - [.trans(ctx, v1, p)](#dummyobjectstore-transctx-v1-p)
     - [context](#dummyobjectstore-context)
   - [ObjectDisp](#objectdisp)
     - [.init(ctx, className, args)](#objectdisp-initctx-classname-args)
     - [.apply(ctx, obj, patch, unapply)](#objectdisp-applyctx-obj-patch-unapply)
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

<a name="dummyobjectstore"></a>
# DummyObjectStore
<a name="dummyobjectstore-initctx-classname-args"></a>
## .init(ctx, className, args)
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

<a name="dummyobjectstore-transctx-v1-p"></a>
## .trans(ctx, v1, p)
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

<a name="dummyobjectstore-context"></a>
## context
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

