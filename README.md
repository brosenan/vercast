# TOC
   - [ObjectDisp](#objectdisp)
     - [.init(ctx, className, args)](#objectdisp-initctx-classname-args)
     - [.apply(ctx, obj, patch, unapply)](#objectdisp-applyctx-obj-patch-unapply)
<a name=""></a>
 
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

