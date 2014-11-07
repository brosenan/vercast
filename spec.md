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
   - [SimpleQueue](#simplequeue)
<a name=""></a>
 
<a name="dummyobjectstore"></a>
# DummyObjectStore
<a name="dummyobjectstore-inittype-args"></a>
## .init(type, args)
should return a version ID of a newly created object.

```js
exports.run(genfunc, cb);
```

<a name="dummyobjectstore-transv-p-u-eq---v-r"></a>
## .trans(v, p, u, EQ) -> {v, r}
should return the value returned from the method corresponding to patch p.

```js
exports.run(genfunc, cb);
```

should pass the patch and u flag as parameters to the called method.

```js
exports.run(genfunc, cb);
```

<a name="dummyobjectstore-context"></a>
## context
<a name="dummyobjectstore-context-inittype-args"></a>
### .init(type, args)
should initialize an object with the given type and args and return its version ID.

```js
exports.run(genfunc, cb);
```

<a name="dummyobjectstore-context-transv-p-u---vr"></a>
### .trans(v, p, u) -> {v,r}
should transform a version and return the new version ID and result.

```js
exports.run(genfunc, cb);
```

<a name="dummyobjectstore-context-conflictmsg"></a>
### .conflict(msg)
should throw an exception with .isConflict set to true.

```js
exports.run(genfunc, cb);
```

<a name="dummyobjectstore-context-effectp"></a>
### .effect(p)
should add patch p to the effect queue.

```js
exports.run(genfunc, cb);
```

should add patches to the effect set even when called from a nested transformation.

```js
exports.run(genfunc, cb);
```

<a name="objectdispatcher"></a>
# ObjectDispatcher
<a name="objectdispatcher-inittype-args"></a>
## .init(type, args)
should return an instance of the referenced type, after calling the init() function associated with the type.

```js
exports.run(genfunc, cb);
```

<a name="objectdispatcher-applyctx-obj-patch-unapply"></a>
## .apply(ctx, obj, patch, unapply)
should call a method corresponding to patch._type.

```js
exports.run(genfunc, cb);
```

<a name="simplequeue"></a>
# SimpleQueue
should retrieve elements in the same order they were entered.

```js
exports.run(genfunc, cb);
```

