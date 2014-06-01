# TOC
   - [Array](#array)
     - [init](#array-init)
     - [apply](#array-apply)
     - [apply_range](#array-apply_range)
   - [AsyncObjectStore](#asyncobjectstore)
     - [.init(className, args, cb(err, v0))](#asyncobjectstore-initclassname-args-cberr-v0)
     - [.transRaw(v1, p, cb(err, v2, r, conf, eff))](#asyncobjectstore-transrawv1-p-cberr-v2-r-conf-eff)
     - [.trans(v1, ps, cb(err, v2, r, conf, w))](#asyncobjectstore-transv1-ps-cberr-v2-r-conf-w)
   - [BinTree](#bintree)
     - [init](#bintree-init)
     - [fetch](#bintree-fetch)
     - [add](#bintree-add)
     - [getMin](#bintree-getmin)
     - [remove](#bintree-remove)
   - [BranchStore](#branchstore)
     - [.init(className, args, cb(err, v0))](#branchstore-initclassname-args-cberr-v0)
     - [.trans(v1, p, cb(err, v2, r, c))](#branchstore-transv1-p-cberr-v2-r-c)
     - [.fork(name, v0, cb(err))](#branchstore-forkname-v0-cberr)
     - [.head(branchName)](#branchstore-headbranchname)
     - [.push(branchName, v2, cb(err))](#branchstore-pushbranchname-v2-cberr)
     - [.pull(v1, versionOrBranch, cb(err, vm))](#branchstore-pullv1-versionorbranch-cberr-vm)
     - [.beginTransaction(v0)](#branchstore-begintransactionv0)
     - [.commit(tranaction, cb(err, v))](#branchstore-committranaction-cberr-v)
   - [BucketObjectStore](#bucketobjectstore)
     - [as ObjectStore](#bucketobjectstore-as-objectstore)
       - [.init(ctx, className, args)](#bucketobjectstore-as-objectstore-initctx-classname-args)
       - [.trans(ctx, v1, p)](#bucketobjectstore-as-objectstore-transctx-v1-p)
       - [context](#bucketobjectstore-as-objectstore-context)
         - [.conflict()](#bucketobjectstore-as-objectstore-context-conflict)
         - [.effect(patch)](#bucketobjectstore-as-objectstore-context-effectpatch)
     - [.hash(bucket, obj)](#bucketobjectstore-hashbucket-obj)
     - [.unhash(id)](#bucketobjectstore-unhashid)
     - [.trans(ctx, v1, p)](#bucketobjectstore-transctx-v1-p)
     - [A 1000 element tree](#bucketobjectstore-a-1000-element-tree)
   - [counter](#counter)
     - [init](#counter-init)
     - [add](#counter-add)
     - [get](#counter-get)
   - [DummyAtomicKVS](#dummyatomickvs)
     - [as AtomicKeyValue](#dummyatomickvs-as-atomickeyvalue)
       - [.newKey(key, val, cb(err))](#dummyatomickvs-as-atomickeyvalue-newkeykey-val-cberr)
       - [.retrieve(key, cb(err, val))](#dummyatomickvs-as-atomickeyvalue-retrievekey-cberr-val)
       - [.modify(key, oldVal, newVal, cb(err, valAfterMod))](#dummyatomickvs-as-atomickeyvalue-modifykey-oldval-newval-cberr-valaftermod)
   - [DummyBucketStore](#dummybucketstore)
     - [async mode](#dummybucketstore-async-mode)
   - [DummyGraphDB](#dummygraphdb)
     - [as GraphDB](#dummygraphdb-as-graphdb)
       - [addEdge](#dummygraphdb-as-graphdb-addedge)
       - [findCommonAncestor](#dummygraphdb-as-graphdb-findcommonancestor)
     - [.findPath(x, y, cb(err, path))](#dummygraphdb-findpathx-y-cberr-path)
   - [DummyObjectStore](#dummyobjectstore)
     - [as ObjectStore](#dummyobjectstore-as-objectstore)
       - [.init(ctx, className, args)](#dummyobjectstore-as-objectstore-initctx-classname-args)
       - [.trans(ctx, v1, p)](#dummyobjectstore-as-objectstore-transctx-v1-p)
       - [context](#dummyobjectstore-as-objectstore-context)
         - [.conflict()](#dummyobjectstore-as-objectstore-context-conflict)
         - [.effect(patch)](#dummyobjectstore-as-objectstore-context-effectpatch)
   - [MergingStateStore](#mergingstatestore)
     - [.init(className, args, cb(v0))](#mergingstatestore-initclassname-args-cbv0)
     - [.trans(v1, p,[ simulate,] cb(v2, r, c))](#mergingstatestore-transv1-p-simulate-cbv2-r-c)
     - [.merge(v1, v2[, resolve], cb(err, vm))](#mergingstatestore-mergev1-v2-resolve-cberr-vm)
   - [ObjectDisp](#objectdisp)
     - [.init(ctx, className, args)](#objectdisp-initctx-classname-args)
     - [.apply(ctx, obj, patch, unapply)](#objectdisp-applyctx-obj-patch-unapply)
   - [Scheduler](#scheduler)
   - [SimpleCache](#simplecache)
     - [.store(id, obj[, json])](#simplecache-storeid-obj-json)
     - [.fetch(id)](#simplecache-fetchid)
     - [.abolish()](#simplecache-abolish)
     - [.waitFor(keys, callback)](#simplecache-waitforkeys-callback)
     - [.check(key)](#simplecache-checkkey)
   - [SimpleVersionGraph](#simpleversiongraph)
     - [.recordTrans(v1, p, w, v2, cb(err))](#simpleversiongraph-recordtransv1-p-w-v2-cberr)
     - [.getMergeStrategy(v1, v2, resolve, cb(err, V1, x, V2, mergeInfo))](#simpleversiongraph-getmergestrategyv1-v2-resolve-cberr-v1-x-v2-mergeinfo)
     - [.getPatches(v1, v2, cb(err, patches))](#simpleversiongraph-getpatchesv1-v2-cberr-patches)
     - [.recordMerge(mergeInfo, newV, patches, confPatches, cb(err))](#simpleversiongraph-recordmergemergeinfo-newv-patches-confpatches-cberr)
   - [util](#util)
     - [seq(funcs, done)](#util-seqfuncs-done)
       - [_.to(names...)](#util-seqfuncs-done-_tonames)
     - [timeUid()](#util-timeuid)
     - [Encoder(allowedSpecial)](#util-encoderallowedspecial)
       - [.encode(str)](#util-encoderallowedspecial-encodestr)
       - [.decode(enc)](#util-encoderallowedspecial-decodeenc)
     - [parallel(n, callback)](#util-paralleln-callback)
     - [Worker](#util-worker)
     - [GrowingInterval](#util-growinginterval)
     - [repeat](#util-repeat)
     - [depend](#util-depend)
   - [vercast](#vercast)
     - [.hash(obj)](#vercast-hashobj)
     - [.genID(bucketID, hash)](#vercast-genidbucketid-hash)
     - [.bucketID(id)](#vercast-bucketidid)
     - [.objID(id)](#vercast-objidid)
     - [.childObjects(obj)](#vercast-childobjectsobj)
     - [.randomByKey(key, prob)](#vercast-randombykeykey-prob)
<a name=""></a>
 
<a name="array"></a>
# Array
<a name="array-init"></a>
## init
should create an array containing objects in their initial version.

```js
var ctx = {};
    var v = ostore.init(ctx, 'Array', {size: 10, className: 'Counter'});
    var counter = ostore.trans(ctx, v, {_type: 'get', index: 2})[1];
    var zero = ostore.trans(ctx, counter, {_type: 'get'})[1];
    assert.equal(zero, 0);
```

<a name="array-apply"></a>
## apply
should relay a patch to an array entry corresponding to the given index.

```js
var ctx = {};
    var v = ostore.init(ctx, 'Array', {size: 6, className: 'Counter'});
    v = ostore.trans(ctx, v, {_type: 'apply', index: 3, patch: {_type: 'add', amount: 4}})[0];
    var counter = ostore.trans(ctx, v, {_type: 'get', index: 3})[1];
    var four = ostore.trans(ctx, counter, {_type: 'get'})[1];
    assert.equal(four, 4);
```

should return the underlying patch's return value.

```js
var ctx = {};
    var v = ostore.init(ctx, 'Array', {size: 10, className: 'Counter'});
    v = ostore.trans(ctx, v, {_type: 'apply', index: 3, patch: {_type: 'add', amount: 5}})[0];
    var five = ostore.trans(ctx, v, {_type: 'apply', index: 3, patch: {_type: 'get'}})[1];
    assert.ifError(ctx.error);
    assert.equal(five, 5);
```

<a name="array-apply_range"></a>
## apply_range
should apply a patch to a given range in the array.

```js
var ctx = {};
    var v = ostore.init(ctx, 'Array', {size: 10, className: 'Counter'});
    v = ostore.trans(ctx, v, {_type: 'apply_range', from: 2, to: 8, patch: {_type: 'add', amount: 3}})[0];
    assert.ifError(ctx.error);
    assert.equal(ostore.trans(ctx, v, {_type: 'apply', index: 1, patch: {_type: 'get'}})[1], 0);
    assert.equal(ostore.trans(ctx, v, {_type: 'apply', index: 2, patch: {_type: 'get'}})[1], 3);
    assert.equal(ostore.trans(ctx, v, {_type: 'apply', index: 5, patch: {_type: 'get'}})[1], 3);
    assert.equal(ostore.trans(ctx, v, {_type: 'apply', index: 7, patch: {_type: 'get'}})[1], 3);
    assert.equal(ostore.trans(ctx, v, {_type: 'apply', index: 8, patch: {_type: 'get'}})[1], 0);
```

<a name="asyncobjectstore"></a>
# AsyncObjectStore
<a name="asyncobjectstore-initclassname-args-cberr-v0"></a>
## .init(className, args, cb(err, v0))
should initialize an object of class className with arguments args and return the ID.

```js
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
```

<a name="asyncobjectstore-transrawv1-p-cberr-v2-r-conf-eff"></a>
## .transRaw(v1, p, cb(err, v2, r, conf, eff))
should apply patch p to v1, to receive v2.

```js
ostore.transRaw(counterVersion, {_type: 'add', amount: 2}, function(err, v2, r, conf) {
	var obj = cache.fetch(v2.$);
	assert.ifError(err);
	assert(!conf, 'should not conflict');
	assert.equal(obj.value, 2);
	done();
    });
```

should return the result r of the patch.

```js
ostore.transRaw(counterVersion, {_type: 'get'}, function(err, v2, r) {
	assert.equal(r, 0);
	done();
    });
```

should return the result version even if the source version is not in the cache.

```js
cache.abolish();
    ostore.transRaw(counterVersion, {_type: 'add', amount: 2}, function(err, v2, r, conf) {
	var obj = cache.fetch(v2.$);
	assert.ifError(err);
	assert(!conf, 'should not conflict');
	assert.equal(obj.value, 2);
	done();
    });
```

should return the result r even if the source version is not in the cache.

```js
cache.abolish();
    ostore.transRaw(counterVersion, {_type: 'get'}, function(err, v2, r) {
	assert.equal(r, 0);
	done();
    });
```

should return the conflict flag (in cache).

```js
ostore.transRaw(myObjVersion, {_type: 'patch', patch: {_type: 'raiseConflict'}}, function(err, v2, r, conf) {
	assert.ifError(err);
	assert(conf, 'should be conflicting');
	done();
    });
```

should return the conflict flag (out of cache).

```js
cache.abolish();
    ostore.transRaw(myObjVersion, {_type: 'patch', patch: {_type: 'raiseConflict'}}, function(err, v2, r, conf) {
	assert.ifError(err);
	assert(conf, 'should be conflicting');
	done();
    });
```

should return all effect patches (in cache).

```js
ostore.transRaw(myObjVersion, {_type: 'patchWithEffect'}, function(err, v2, r, conf, eff) {
	assert.ifError(err);
	assert.equal(eff.length, 6);
	done();
    });
```

should return all effect patches (out of cache).

```js
cache.abolish();
    ostore.transRaw(myObjVersion, {_type: 'patchWithEffect'}, function(err, v2, r, conf, eff) {
	assert.ifError(err);
	assert.equal(eff.length, 6);
	done();
    });
```

<a name="asyncobjectstore-transv1-ps-cberr-v2-r-conf-w"></a>
## .trans(v1, ps, cb(err, v2, r, conf, w))
should perform transitions and return the result version and result.

```js
ostore.trans(myObjVersion, [{_type: 'counterPatch', patch: {_type: 'add', amount: 4}}], function(err, v2) {
	if(err) return done(err);
	ostore.trans(v2, [{_type: 'counterPatch', patch: {_type: 'get'}}], function(err, v3, r) {
	    if(err) return done(err);
	    assert.equal(r[0], 4);
	    done();
	});
    });
```

should perform a sequence of transitions, returning the result of each.

```js
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
```

should update the conflict flag appropriately.

```js
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
```

should apply effect patches resulting from previous patches, automatically.

```js
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
```

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
var v0 = ostore.init({}, 'BinTree', {key: 'foo', value: 'bar'});
    var ctx = {foo: 123};
    var v1 = ostore.trans(ctx, v0, {_type: 'add', key: 'foo', value: 'baz'})[0];
    assert(ctx.conf, 'Should be conflicting');
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

<a name="branchstore"></a>
# BranchStore
<a name="branchstore-transv1-p-cberr-v2-r-c"></a>
## .trans(v1, p, cb(err, v2, r, c))
should accept a transaction object in place of v1, and update it.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
	function(_) { this.t = branchStore.beginTransaction(this.v0);
		      branchStore.trans(this.t, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1'));},
	function(_) { branchStore.trans(this.t, {_type: 'fetch', key: 'foo'}, _.to('v1', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); 
		      assert.equal(this.t.curr.$, this.v1.$); _(); },
    ], done)();
```

should not record transitions based on transactions in the version graph.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
	function(_) { this.t = branchStore.beginTransaction(this.v0);
		      branchStore.trans(this.t, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { branchStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { branchStore.pull(this.v1, this.v2, _.to('vm')); },
	function(_) { assert(false, 'Pull should throw an exception'); _(); },
    ], function(err) {
	var prefix = 'No path found from'
	if(err.message.substr(0, prefix.length) == prefix) done();
	else done(err);
    })();
```

<a name="branchstore-forkname-v0-cberr"></a>
## .fork(name, v0, cb(err))
should create a new branch of the given name, and set its head version to v0.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v')); },
	function(_) { branchStore.fork('b1', this.v, _); },
	function(_) { assert.deepEqual(branchStore.head('b1'), this.v); _(); },
    ], done)();
```

<a name="branchstore-headbranchname"></a>
## .head(branchName)
should return the last known version of the given branch.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v')); },
	function(_) { branchStore.fork('b1', this.v, _); },
	function(_) { assert.deepEqual(branchStore.head('b1'), this.v); _(); },
    ], done)();
```

<a name="branchstore-pushbranchname-v2-cberr"></a>
## .push(branchName, v2, cb(err))
should assign v2 to the head of the branch, if v2 is a descendant of the current head.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v')); },
	function(_) { branchStore.fork('b1', this.v, _); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v2')); },
	function(_) { branchStore.push('b1', this.v2, _); },
	function(_) { assert.deepEqual(branchStore.head('b1'), this.v2); _(); },
    ], done)();
```

should merge the head version and v2 if not a direct descendant.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v')); },
	function(_) { branchStore.fork('b1', this.v, _); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { branchStore.push('b1', this.v1, _); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { branchStore.push('b1', this.v2, _); },
	function(_) { branchStore.trans(branchStore.head('b1'), {_type: 'fetch', key: 'foo'}, _.to('v3', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); _(); },
	function(_) { branchStore.trans(branchStore.head('b1'), {_type: 'fetch', key: 'bar'}, _.to('v3', 'r')); },
	function(_) { assert.equal(this.r, 'BAR'); _(); },
    ], done)();
```

should fail if a conflict is encountered.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v')); },
	function(_) { branchStore.fork('b1', this.v, _); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { branchStore.push('b1', this.v1, _); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO2'}, _.to('v2')); },
	function(_) { branchStore.push('b1', this.v2, _); },
	function(_) { assert(false, 'push() should fail'); _(); },
    ], function(err) {
	if(err.conflict) done();
	else done(err);
    })();
```

should handle cases where two pushes are done in parallel. If no conflicts occur, the resulting head should include all contributions.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v')); },
	function(_) { branchStore.fork('b1', this.v, _); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { var para = util.parallel(2, _); 
		      branchStore.push('b1', this.v1, para);
		      branchStore.push('b1', this.v2, para); },
	function(_) { branchStore.trans(branchStore.head('b1'), {_type: 'fetch', key: 'foo'}, _.to('v3', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); _(); },
	function(_) { branchStore.trans(branchStore.head('b1'), {_type: 'fetch', key: 'bar'}, _.to('v3', 'r')); },
	function(_) { assert.equal(this.r, 'BAR'); _(); },
    ], done)();
```

<a name="branchstore-pullv1-versionorbranch-cberr-vm"></a>
## .pull(v1, versionOrBranch, cb(err, vm))
should merge between the two versions (if so given).

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v')); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { branchStore.pull(this.v1, this.v2, _.to('vm')); },
	function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('v3', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); _(); },
	function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'bar'}, _.to('v3', 'r')); },
	function(_) { assert.equal(this.r, 'BAR'); _(); },
    ], done)();
```

should merge between the given version and the given branch (if so given).

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v')); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { branchStore.fork('b1', this.v1, _); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { branchStore.pull(this.v2, 'b1', _.to('vm')); },
	function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('v3', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); _(); },
	function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'bar'}, _.to('v3', 'r')); },
	function(_) { assert.equal(this.r, 'BAR'); _(); },
    ], done)();
```

should resolve conflicts, should they occur, by preferring the second argument.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v')); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { branchStore.trans(this.v1, {_type: 'add', key: 'bar', value: 'BARFOOD'}, _.to('v1')); },
	function(_) { branchStore.fork('b1', this.v1, _); },
	function(_) { branchStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { branchStore.pull(this.v2, 'b1', _.to('vm')); },
	function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('v3', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); _(); },
	function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'bar'}, _.to('v3', 'r')); },
	function(_) { assert.equal(this.r, 'BARFOOD'); _(); },
    ], done)();
```

<a name="branchstore-begintransactionv0"></a>
## .beginTransaction(v0)
should return a transaction object for which both baseline version and current version are v0.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
	function(_) { var trans = branchStore.beginTransaction(this.v0); 
		      assert.equal(trans.baseline.$, this.v0.$);
		      assert.equal(trans.curr.$, this.v0.$);
		      _();
		    },
    ], done)();
```

<a name="branchstore-committranaction-cberr-v"></a>
## .commit(tranaction, cb(err, v))
should record the transaction in the version graph.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
	function(_) { this.t = branchStore.beginTransaction(this.v0);
		      branchStore.trans(this.t, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { branchStore.trans(this.t, {_type: 'add', key: 'foo2', value: 'FOO2'}, _.to('v1')); },
	function(_) { branchStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { branchStore.commit(this.t, _); },
	function(_) { branchStore.pull(this.v1, this.v2, _.to('vm')); },
	function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('vm', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); _(); },
    ], done)();
```

should keep transactions together when conflicts occur.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
	function(_) { this.t = branchStore.beginTransaction(this.v0);
		      branchStore.trans(this.t, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { branchStore.trans(this.t, {_type: 'add', key: 'foo2', value: 'FOO2'}, _.to('v1')); },
	function(_) { branchStore.commit(this.t, _); },
	function(_) { branchStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { branchStore.trans(this.v2, {_type: 'add', key: 'foo', value: 'FOO3'}, _.to('v2')); }, // conflicting with our transaction
	function(_) { branchStore.pull(this.v1, this.v2, _.to('vm')); },
	function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('vm', 'r')); },
	function(_) { assert.equal(this.r, 'FOO3'); _(); }, // v2 wins
	function(_) { branchStore.trans(this.vm, {_type: 'fetch', key: 'foo2'}, _.to('vm', 'r')); },
	function(_) { assert.equal(typeof this.r, 'undefined'); _(); }, // even the non-conflicting changes in the transaction are rolled back
    ], done)();
```

should record losing transactions such that they are canceled.

```js
util.seq([
	function(_) { branchStore.init('BinTree', {}, _.to('v0')); },
	function(_) { this.t = branchStore.beginTransaction(this.v0);
		      branchStore.trans(this.t, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { branchStore.trans(this.t, {_type: 'add', key: 'foo2', value: 'FOO2'}, _.to('v1')); },
	function(_) { branchStore.commit(this.t, _); },
	function(_) { branchStore.trans(this.v1, {_type: 'add', key: 'otherThing', value: 4}, _.to('v1')); },
	function(_) { branchStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { branchStore.trans(this.v2, {_type: 'add', key: 'foo', value: 'FOO3'}, _.to('v2')); },
	function(_) { branchStore.pull(this.v1, this.v2, _.to('vm')); },
	function(_) { branchStore.trans(this.v1, {_type: 'add', key: 'somethingElse', value: 3}, _.to('v3')); },
	function(_) { branchStore.pull(this.vm, this.v3, _.to('vm2')); }, // v3, that contains the transaction, should win
	function(_) { branchStore.trans(this.vm2, {_type: 'fetch', key: 'foo'}, _.to('vm2', 'r')); },
	function(_) { assert.equal(this.r, 'FOO3'); _(); }, // but vm won
	function(_) { branchStore.trans(this.vm2, {_type: 'fetch', key: 'foo2'}, _.to('vm2', 'r')); },
	function(_) { assert.equal(typeof this.r, 'undefined'); _(); }, // the transaction is still canceled.
    ], done)();
```

<a name="bucketobjectstore"></a>
# BucketObjectStore
<a name="bucketobjectstore-as-objectstore"></a>
## as ObjectStore
<a name="bucketobjectstore-as-objectstore-initctx-classname-args"></a>
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
var ostore = new createOstore(disp);
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

<a name="bucketobjectstore-as-objectstore-transctx-v1-p"></a>
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

should pass exceptions thrown by patch methods as the error field of the context.

```js
var disp = new ObjectDisp({
    Class1: {
	init: function(ctx, args) {
	},
	emitError: function(ctx, patch) {
	    throw new Error('This is an error');
	},
    }
});
var ostore = createOstore(disp);
var v = ostore.init({}, 'Class1', {});
var ctx = {};
v = ostore.trans(ctx, v, {_type: 'emitError'})[1];
assert.equal(ctx.error.message, 'This is an error');
done();
```

should propagate exceptions thrown by underlying invocations.

```js
var disp = new ObjectDisp({
    Child: {
	init: function(ctx, args) {
	},
	emitError: function(ctx, patch) {
	    throw new Error('This is an error');
	},
    },
    Parent: {
	init: function(ctx, args) {
	    this.foo = ctx.init('Child', args);
	},
	patch: function(ctx, p) {
	    this.foo = ctx.trans(this.foo, p.patch);
	},
    },
});
var ostore = createOstore(disp);
var v = ostore.init({}, 'Parent', {});
var ctx = {};
v = ostore.trans(ctx, v, {_type: 'patch', patch: {_type: 'emitError'}})[1];
assert.equal(ctx.error.message, 'This is an error');
done();
```

<a name="bucketobjectstore-as-objectstore-context"></a>
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
var ostore = createOstore(disp);
var v = ostore.init({}, 'MyClass', {});
v = ostore.trans({}, v, {_type: 'patchCounter', p: {_type: 'add', amount: 12}})[0];
r = ostore.trans({}, v, {_type: 'patchCounter', p: {_type: 'get'}})[1];
assert.equal(r, 12);
done();
```

<a name="bucketobjectstore-as-objectstore-context-conflict"></a>
#### .conflict()
should set the context's confclit flag to true.

```js
var disp = new ObjectDisp({
	Class2: {
	    init: function(ctx, args) {
		this.bar = args.val;
	    },
	    raiseConflict: function(ctx, p) {
		ctx.conflict();
	    },
	}
    });
    var ostore = new createOstore(disp);
    var v = ostore.init({}, 'Class2', {val:2});
    var ctx = {};
    v = ostore.trans(ctx, v, {_type: 'raiseConflict'})[0];
    assert(ctx.conf, 'Conflict flag should be true');
    done();
```

should propagate conflicts to calling transitions.

```js
var disp = new ObjectDisp({
	Class1: {
	    init: function(ctx, args) {
		this.foo = ctx.init('Class2', args);
	    },
	    patch: function(ctx, p) {
		this.foo = ctx.trans(this.foo, p.patch);
	    },
	    query: function(ctx, q) {
		return ctx.query(this.foo, q.query);
	    },
	},
	Class2: {
	    init: function(ctx, args) {
		this.bar = args.val;
	    },
	    raiseConflict: function(ctx, p) {
		ctx.conflict();
	    },
	}
    });
    var ostore = new createOstore(disp);
    var v = ostore.init({}, 'Class1', {val:2});
    var ctx = {};
    v = ostore.trans(ctx, v, {_type: 'patch', patch: {_type: 'raiseConflict'}})[0];
    assert(ctx.conf, 'Conflict flag should be true');
    done();
```

<a name="bucketobjectstore-as-objectstore-context-effectpatch"></a>
#### .effect(patch)
should add a patch to the effect set held by the context.

```js
var disp = new ObjectDisp({
	Class1: {
	    init: function(ctx, args) {
	    },
	    addEffectPatch: function(ctx, patch) {
		ctx.effect(patch.patch);
	    },
	}
    });
    var ostore = createOstore(disp);
    var v = ostore.init({}, 'Class1', {});
    var ctx = {};
    v = ostore.trans(ctx, v, {_type: 'addEffectPatch', patch: {_type: 'foo'}})[1];
    assert(!ctx.error, 'No error should occur');
    assert.deepEqual(ctx.eff, [{_type: 'foo'}]);
    done();
```

<a name="bucketobjectstore-hashbucket-obj"></a>
## .hash(bucket, obj)
should return a unique ID for each given object and bucket ID.

```js
var id1 = ostore.hash('foo', {bar: 1});
    var id2 = ostore.hash('foo', {bar: 2});
    var id3 = ostore.hash('food', {bar: 1});
    assert(id1.$ != id2.$, 'Object should matter');
    assert(id1.$ != id3.$, 'Bucket should matter');
    done();
```

should cache the object under its ID.

```js
var id2 = ostore.hash('foo', {bar: 2});
    assert.equal(cache.fetch(id2.$).bar, 2);
    done();
```

<a name="bucketobjectstore-unhashid"></a>
## .unhash(id)
should return the object corresponding to id, if in the cache.

```js
var id = ostore.hash('foo', {bar: 2});
    assert.equal(ostore.unhash(id).bar, 2);
    done();
```

should return the contents of an object given its ID, if in the cache.

```js
var id = ostore.init({}, 'Counter', {});
    assert.equal(ostore.unhash(id).value, 0);
    done();
```

should put things in motion to retrieve the value of the ID, if not in the cache.

```js
var id = ostore.init({}, 'Counter', {});
    cache.abolish();
    var id2 = ostore.unhash(id);
    assert.equal(typeof id2, 'undefined');
    cache.waitFor([id.$], done);
```

<a name="bucketobjectstore-transctx-v1-p"></a>
## .trans(ctx, v1, p)
should return v2=undefined if v1 is not in cache.

```js
var ctx = {};
    var v1 = ostore.init(ctx, 'Counter', {});
    cache.abolish();
    var pair = ostore.trans(ctx, v1, {_type: 'add', amount: 10});
    assert.equal(typeof pair[0], 'undefined');
    done();
```

should add a field named "waitFor" to the context, containing a list of cache entries.  Waiting on them assures .trans() returns value.

```js
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
```

should support recursive transitions.

```js
var ctx = {};
    var v = ostore.init(ctx, 'BinTree', {key: 'a', value: 1});
    v = ostore.trans(ctx, v, {_type: 'add', key: 'b', value: 2})[0];
    v = ostore.trans(ctx, v, {_type: 'add', key: 'c', value: 3})[0];
    var r = ostore.trans(ctx, v, {_type: 'fetch', key: 'c'})[1];
    assert.equal(r, 3);
    done();
```

should support recursive transitions even at the event of not having items in the cache (waitFor should be filled accordingly).

```js
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
```

<a name="bucketobjectstore-a-1000-element-tree"></a>
## A 1000 element tree
should recall any number.

```js
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
```

should call make a reasonable number of calls to the bucket store.

```js
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

<a name="dummyatomickvs"></a>
# DummyAtomicKVS
<a name="dummyatomickvs-as-atomickeyvalue"></a>
## as AtomicKeyValue
<a name="dummyatomickvs-as-atomickeyvalue-newkeykey-val-cberr"></a>
### .newKey(key, val, cb(err))
should store a new key/value pair, given that key does not already exist.

```js
util.seq([
    function(_) { atomicKV.newKey('foo', 'bar', _); },
    function(_) { atomicKV.retrieve('foo', _.to('value')); },
    function(_) { assert.equal(this.value, 'bar'); _(); },
], done)();
```

should emit an error when the key already exists.

```js
util.seq([
    function(_) { atomicKV.newKey('foo', 'bar', _); },
    function(_) { atomicKV.newKey('foo', 'bar', _); },
], function(err) {
    assert(err, 'An error should be emitted');
    done(err.message == 'Key foo already exists' ? undefined : err);
})();
```

<a name="dummyatomickvs-as-atomickeyvalue-retrievekey-cberr-val"></a>
### .retrieve(key, cb(err, val))
should emit an error if the value does not exist.

```js
util.seq([
    function(_) { atomicKV.retrieve('foo', _.to('value')); },
    function(_) { assert(false, 'the value is not supposed to be found'); _(); },
], function(err) {
    assert(err, 'An error should be emitted');
    done(err.message == 'Key foo was not found' ? undefined : err);
})();
```

<a name="dummyatomickvs-as-atomickeyvalue-modifykey-oldval-newval-cberr-valaftermod"></a>
### .modify(key, oldVal, newVal, cb(err, valAfterMod))
should change the value under key to newVal, given that the previous value was oldVal.

```js
util.seq([
    function(_) { atomicKV.newKey('foo', 'bar', _); },
    function(_) { atomicKV.modify('foo', 'bar', 'baz', _.to('valAfterMod')); },
    function(_) { assert.equal(this.valAfterMod, 'baz'); _(); },
    function(_) { atomicKV.retrieve('foo', _.to('val')); },
    function(_) { assert.equal(this.val, 'baz'); _(); },
], done)();
```

should not change the value under key if the current value does not equal oldVal.

```js
util.seq([
    function(_) { atomicKV.newKey('foo', 'bar', _); },
    function(_) { atomicKV.modify('foo', 'baz', 'bat', _.to('valAfterMod')); },
    function(_) { assert.equal(this.valAfterMod, 'bar'); _(); }, // The value before the change
    function(_) { atomicKV.retrieve('foo', _.to('val')); },
    function(_) { assert.equal(this.val, 'bar'); _(); },
], done)();
```

<a name="dummybucketstore"></a>
# DummyBucketStore
should accumulate all added items and replay them when fetched.

```js
var bucketStore = new DummyBucketStore(sched);
// Add values to the bucket
var values = {one: 1, two: 2, three: 3};
for(var key in values) {
    bucketStore.add('myBucket', {key: key, value: values[key]});
}
// Trigger a fetch
bucketStore.fetch('myBucket', function(err, item) {
    assert(item.key in values, 'the  bucket should only contain the added keys');
    delete values[item.key];
    if(isEmpty(values)) done();
});
```

should store each bucket individually.

```js
var bucketStore = new DummyBucketStore(sched);
var values = {one: 1, two: 2, three: 3};
for(var key in values) {
    bucketStore.add('myBucket', {key: key, value: values[key]});
    bucketStore.add('myOtherBucket', {key: 'other_' + key, value: values[key] + 2});
}
bucketStore.fetch('myBucket', function(err, item) {
    assert(item.key in values, 'item ' + JSON.stringify(item) + ' should not be in bucket');
    delete values[item.key];
    if(isEmpty(values)) done();
});
```

<a name="dummybucketstore-async-mode"></a>
## async mode
should return a unique ID when adding to a bucket, such that registering to that ID guarantees the data has been saved.

```js
var bucketStore = new DummyBucketStore(sched);
    bucketStore.async = true; // async mode on
    // Add values to the bucket
    var values = {one: 1, two: 2, three: 3};
    var IDs = [];
    for(var key in values) {
	var ID = bucketStore.add('myBucket', {key: key, value: values[key]});
	IDs.push(ID);
    }
    // Wait until all is written
    sched.register(IDs, function() {
	// Trigger a fetch
	bucketStore.fetch('myBucket', function(err, item) {
	    assert(item.key in values, 'the  bucket should only contain the added keys');
	    delete values[item.key];
	    if(isEmpty(values)) done();
	});
    });
```

should not apply changes immediately.

```js
var bucketStore = new DummyBucketStore(sched);
    bucketStore.async = true; // async mode on
    bucketStore.add('myBucket', {foo: 'bar'});
    bucketStore.fetch('myBucket', function(err) {
	assert.equal(err.message, 'Bucket myBucket not found');
	done();
    });
```

<a name="dummygraphdb"></a>
# DummyGraphDB
<a name="dummygraphdb-as-graphdb"></a>
## as GraphDB
<a name="dummygraphdb-as-graphdb-addedge"></a>
### addEdge
should accept an edge and add it to the graph.

```js
util.seq([
    function(_) { graphDB.addEdge("foo", "likes", "bar", _); },
    function(_) { graphDB.queryEdge("foo", "likes", _.to('shouldBeBar')); },
    function(_) { assert.equal(this.shouldBeBar, 'bar'); _(); },
], done)();
```

should create a dual mapping, mapping also the destination to the source.

```js
util.seq([
    function(_) { graphDB.addEdge("foo", "likes", "bar", _); },
    function(_) { graphDB.queryBackEdge("bar", "likes", _.to('shouldBeFoo')); },
    function(_) { assert.equal(this.shouldBeFoo, 'foo'); _(); },
], done)();
```

<a name="dummygraphdb-as-graphdb-findcommonancestor"></a>
### findCommonAncestor
should find the common ancestor of two nodes, and the path to each of them.

```js
util.seq([
    function(_) { graphDB.addEdge('terah', 'p1', 'abraham', _); },
    function(_) { graphDB.addEdge('abraham', 'p2', 'isaac', _); },
    function(_) { graphDB.addEdge('isaac', 'p3', 'jacob', _); },
    function(_) { graphDB.addEdge('jacob', 'p4', 'joseph', _); },
    function(_) { graphDB.addEdge('abraham', 'p5', 'ismael', _); },
    function(_) { graphDB.addEdge('isaac', 'p6', 'esaw', _); },
    function(_) { graphDB.addEdge('jacob', 'p7', 'simon', _); },
    function(_) { graphDB.findCommonAncestor('simon', 'ismael', _.to('ancestor', 'path1', 'path2')); },
    function(_) { assert.equal(this.ancestor, 'abraham'); _(); },
], done)();
```

should handle the case where there are also common descendants.

```js
util.seq([
    function(_) { createGraph(1, 1, 30, _); },
    function(_) { graphDB.findCommonAncestor(4, 6, _.to('ancestor', 'p1', 'p2')); },
    function(_) { assert.equal(this.ancestor, 2); _(); },
], done)();
```

should return the path from the common ancestor to both nodes.

```js
util.seq([
    function(_) { createGraph(1, 1, 30, _); },
    function(_) { graphDB.findCommonAncestor(8, 10, _.to('ancestor', 'p1', 'p2')); },
    function(_) { assert.equal(this.ancestor, 2); _(); },
    function(_) { assert.deepEqual(this.p1, ['2', '2']); _(); },
    function(_) { assert.deepEqual(this.p2, ['5']); _(); },
], done)();
```

<a name="dummygraphdb-findpathx-y-cberr-path"></a>
## .findPath(x, y, cb(err, path))
should return the labels along the edges from x to y.

```js
util.seq([
	function(_) { createGraph(1, 1, 30, _); },
	function(_) { graphDB.findPath(3, 24, _.to('path')); },
	function(_) { var m = 1;
		      for(var i = 0; i < this.path.length; i++) {
			  m *= this.path[i];
		      }
		      assert.equal(m, 8); // 24 / 3
		      _(); },
    ], done)();
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
var ostore = new createOstore(disp);
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

should pass exceptions thrown by patch methods as the error field of the context.

```js
var disp = new ObjectDisp({
    Class1: {
	init: function(ctx, args) {
	},
	emitError: function(ctx, patch) {
	    throw new Error('This is an error');
	},
    }
});
var ostore = createOstore(disp);
var v = ostore.init({}, 'Class1', {});
var ctx = {};
v = ostore.trans(ctx, v, {_type: 'emitError'})[1];
assert.equal(ctx.error.message, 'This is an error');
done();
```

should propagate exceptions thrown by underlying invocations.

```js
var disp = new ObjectDisp({
    Child: {
	init: function(ctx, args) {
	},
	emitError: function(ctx, patch) {
	    throw new Error('This is an error');
	},
    },
    Parent: {
	init: function(ctx, args) {
	    this.foo = ctx.init('Child', args);
	},
	patch: function(ctx, p) {
	    this.foo = ctx.trans(this.foo, p.patch);
	},
    },
});
var ostore = createOstore(disp);
var v = ostore.init({}, 'Parent', {});
var ctx = {};
v = ostore.trans(ctx, v, {_type: 'patch', patch: {_type: 'emitError'}})[1];
assert.equal(ctx.error.message, 'This is an error');
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
var ostore = createOstore(disp);
var v = ostore.init({}, 'MyClass', {});
v = ostore.trans({}, v, {_type: 'patchCounter', p: {_type: 'add', amount: 12}})[0];
r = ostore.trans({}, v, {_type: 'patchCounter', p: {_type: 'get'}})[1];
assert.equal(r, 12);
done();
```

<a name="dummyobjectstore-as-objectstore-context-conflict"></a>
#### .conflict()
should set the context's confclit flag to true.

```js
var disp = new ObjectDisp({
	Class2: {
	    init: function(ctx, args) {
		this.bar = args.val;
	    },
	    raiseConflict: function(ctx, p) {
		ctx.conflict();
	    },
	}
    });
    var ostore = new createOstore(disp);
    var v = ostore.init({}, 'Class2', {val:2});
    var ctx = {};
    v = ostore.trans(ctx, v, {_type: 'raiseConflict'})[0];
    assert(ctx.conf, 'Conflict flag should be true');
    done();
```

should propagate conflicts to calling transitions.

```js
var disp = new ObjectDisp({
	Class1: {
	    init: function(ctx, args) {
		this.foo = ctx.init('Class2', args);
	    },
	    patch: function(ctx, p) {
		this.foo = ctx.trans(this.foo, p.patch);
	    },
	    query: function(ctx, q) {
		return ctx.query(this.foo, q.query);
	    },
	},
	Class2: {
	    init: function(ctx, args) {
		this.bar = args.val;
	    },
	    raiseConflict: function(ctx, p) {
		ctx.conflict();
	    },
	}
    });
    var ostore = new createOstore(disp);
    var v = ostore.init({}, 'Class1', {val:2});
    var ctx = {};
    v = ostore.trans(ctx, v, {_type: 'patch', patch: {_type: 'raiseConflict'}})[0];
    assert(ctx.conf, 'Conflict flag should be true');
    done();
```

<a name="dummyobjectstore-as-objectstore-context-effectpatch"></a>
#### .effect(patch)
should add a patch to the effect set held by the context.

```js
var disp = new ObjectDisp({
	Class1: {
	    init: function(ctx, args) {
	    },
	    addEffectPatch: function(ctx, patch) {
		ctx.effect(patch.patch);
	    },
	}
    });
    var ostore = createOstore(disp);
    var v = ostore.init({}, 'Class1', {});
    var ctx = {};
    v = ostore.trans(ctx, v, {_type: 'addEffectPatch', patch: {_type: 'foo'}})[1];
    assert(!ctx.error, 'No error should occur');
    assert.deepEqual(ctx.eff, [{_type: 'foo'}]);
    done();
```

<a name="mergingstatestore"></a>
# MergingStateStore
<a name="mergingstatestore-transv1-p-simulate-cbv2-r-c"></a>
## .trans(v1, p,[ simulate,] cb(v2, r, c))
should apply p to v1 to receive v2.

```js
util.seq([
	function(_) { stateStore.init('BinTree', {}, _.to('v')); },
	function(_) { stateStore.trans(this.v, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v')); },
	function(_) { stateStore.trans(this.v, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v')); },
	function(_) { stateStore.trans(this.v, {_type: 'fetch', key: 'foo'}, _.to('v', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); _(); },
    ], done)();
```

should not record the transition if simulate is true.

```js
util.seq([
	function(_) { stateStore.init('BinTree', {}, _.to('v0')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, true, _.to('v2')); },
	function(_) { stateStore.merge(this.v1, this.v2, _.to('vm')); },
	function(_) { assert(false, 'Merge should throw an exception'); _(); },
    ], function(err) {
	var prefix = 'No path found from'
	if(err.message.substr(0, prefix.length) == prefix) done();
	else done(err);
    })();
```

<a name="mergingstatestore-mergev1-v2-resolve-cberr-vm"></a>
## .merge(v1, v2[, resolve], cb(err, vm))
should return version vm which is a merge of both versions v1 and v2.

```js
util.seq([
	function(_) { stateStore.init('BinTree', {}, _.to('v0')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { stateStore.merge(this.v1, this.v2, _.to('vm')); },
	function(_) { stateStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('v', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); _(); },
	function(_) { stateStore.trans(this.vm, {_type: 'fetch', key: 'bar'}, _.to('v', 'r')); },
	function(_) { assert.equal(this.r, 'BAR'); _(); },
    ], done)();
```

should record the merge so that further merges would work.

```js
util.seq([
	function(_) { stateStore.init('BinTree', {}, _.to('v0')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { stateStore.merge(this.v1, this.v2, _.to('v1')); }, // merge once
	function(_) { stateStore.trans(this.v2, {_type: 'add', key: 'baz', value: 'BAZ'}, _.to('v2')); },
	function(_) { stateStore.merge(this.v1, this.v2, _.to('v1')); }, // merge twice
	function(_) { stateStore.trans(this.v1, {_type: 'fetch', key: 'foo'}, _.to('v', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); _(); },
	function(_) { stateStore.trans(this.v1, {_type: 'fetch', key: 'bar'}, _.to('v', 'r')); },
	function(_) { assert.equal(this.r, 'BAR'); _(); },
	function(_) { stateStore.trans(this.v1, {_type: 'fetch', key: 'baz'}, _.to('v', 'r')); },
	function(_) { assert.equal(this.r, 'BAZ'); _(); },
    ], done)();
```

should report a conflict as an error, when one occurs.

```js
util.seq([
	function(_) { stateStore.init('BinTree', {}, _.to('v0')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'BAR'}, _.to('v2')); }, // Notice the "foo"
	function(_) { stateStore.merge(this.v1, this.v2, _.to('vm')); },
	function(_) { assert(false, 'Last step should have raised a conflict exception'); _(); },
    ], function(err) {
	if(!err.conflict) done(err);
	else done();
    })();
```

should resolve conflicts if asked to, by prioritizing v1 over v2.

```js
util.seq([
	function(_) { stateStore.init('BinTree', {}, _.to('v0')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { stateStore.trans(this.v1, {_type: 'add', key: 'baz', value: 'BAZ'}, _.to('v1')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO2'}, _.to('v2')); }, // Note the same key
	function(_) { stateStore.trans(this.v2, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { stateStore.merge(this.v1, this.v2, true, _.to('vm')); },
	function(_) { stateStore.trans(this.vm, {_type: 'fetch', key: 'foo'}, _.to('vm', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); _(); },
	function(_) { stateStore.trans(this.vm, {_type: 'fetch', key: 'bar'}, _.to('vm', 'r')); },
	function(_) { assert.equal(this.r, 'BAR'); _(); },
	function(_) { stateStore.trans(this.vm, {_type: 'fetch', key: 'baz'}, _.to('vm', 'r')); },
	function(_) { assert.equal(this.r, 'BAZ'); _(); },
    ], done)();
```

should record conflict resolutions by undoing the conflicting patches.

```js
util.seq([
	function(_) { stateStore.init('BinTree', {}, _.to('v0')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO'}, _.to('v1')); },
	function(_) { stateStore.trans(this.v1, {_type: 'add', key: 'baz', value: 'BAZ'}, _.to('v1')); },
	function(_) { stateStore.trans(this.v0, {_type: 'add', key: 'foo', value: 'FOO2'}, _.to('v2')); }, // The conflict
	function(_) { stateStore.trans(this.v2, {_type: 'add', key: 'bar', value: 'BAR'}, _.to('v2')); },
	function(_) { stateStore.merge(this.v1, this.v2, true, _.to('vm')); }, // like before, vm should have foo->FOO and not FOO2.
	function(_) { stateStore.trans(this.v2, {_type: 'add', key: 'bat', value: 'BAT'}, _.to('v3')); },
	function(_) { stateStore.merge(this.v3, this.vm, true, _.to('vm2')); }, // Should apply patches to v3
	function(_) { stateStore.trans(this.vm2, {_type: 'fetch', key: 'foo'}, _.to('vm2', 'r')); },
	function(_) { assert.equal(this.r, 'FOO'); _(); }, // and not FOO2
	function(_) { stateStore.trans(this.vm2, {_type: 'fetch', key: 'bar'}, _.to('vm2', 'r')); },
	function(_) { assert.equal(this.r, 'BAR'); _(); },
	function(_) { stateStore.trans(this.vm2, {_type: 'fetch', key: 'baz'}, _.to('vm2', 'r')); },
	function(_) { assert.equal(this.r, 'BAZ'); _(); },
	function(_) { stateStore.trans(this.vm2, {_type: 'fetch', key: 'bat'}, _.to('vm2', 'r')); },
	function(_) { assert.equal(this.r, 'BAT'); _(); },
    ], done)();
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
    done();
});
assert(!called, 'Callback should not have been called yet');
sched.notify('foo');
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
    if(called1 && called2 && called3) done();
});
var called2 = false;
sched.register(['foo'], function() {
    called2 = true;
    if(called1 && called2 && called3) done();
});
var called3 = false;
sched.register(['foo'], function() {
    called3 = true;
    if(called1 && called2 && called3) done();
});
assert(!called1, 'Callback 1 should not have been called yet');
assert(!called2, 'Callback 2 should not have been called yet');
assert(!called3, 'Callback 3 should not have been called yet');
sched.notify('foo');
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
    done();
});
sched.notify('bar');
sched.notify('foo');
sched.notify('bat');
assert(!called, 'Callback should not have been called yet');
sched.notify('baz');
```

<a name="simplecache"></a>
# SimpleCache
<a name="simplecache-storeid-obj-json"></a>
## .store(id, obj[, json])
should store an object in the cache under the given ID.

```js
var cache = new SimpleCache(sched);
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
var cache = new SimpleCache(sched);
    var one = {value: 1};
    cache.store('one', one);
    one.value = 2;
    assert.equal(cache.fetch('one').value, 2);
    done();
```

should retrieve the same object once and again, even if it was modified on the outside.

```js
var cache = new SimpleCache(sched);
    cache.store('one', {value: 1});
    var one = cache.fetch('one');
    one.value = 2;
    assert.equal(cache.fetch('one').value, 1);
    done();
```

should use the json argument, if supplied, as the JSON representation of the object to be used when the instance is no longer available.

```js
var cache = new SimpleCache(sched);
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
var cache = new SimpleCache(sched);
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
var cache = new SimpleCache(sched);
    var called = false;
    cache.waitFor(['foo', 'bar'], function() {
	called = true;
	done();
    });
    cache.store('foo', 12);
    assert(!called, 'Callback should not have been called yet');
    cache.store('bar', 21);
```

should throw an exception if one of the keys is already in the cache.

```js
var cache = new SimpleCache(sched);
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

<a name="simplecache-checkkey"></a>
## .check(key)
should return true if key exists in the cache.

```js
var cache = new SimpleCache(sched);
    cache.store('foo', 14);
    assert(cache.check('foo'), 'foo is in the cache');
    assert(!cache.check('bar'), 'bar is not in the cache');
    done();
```

<a name="simpleversiongraph"></a>
# SimpleVersionGraph
<a name="simpleversiongraph-recordtransv1-p-w-v2-cberr"></a>
## .recordTrans(v1, p, w, v2, cb(err))
should return a callback with no error if all is OK.

```js
versionGraph.recordTrans({$:'foo'}, {_type: 'myPatch'}, 1, {$:'bar'}, done);
```

<a name="simpleversiongraph-getmergestrategyv1-v2-resolve-cberr-v1-x-v2-mergeinfo"></a>
## .getMergeStrategy(v1, v2, resolve, cb(err, V1, x, V2, mergeInfo))
should return x as the common ancestor of v1 and v2.

```js
util.seq([
	function(_) { versionGraph.getMergeStrategy({$:18}, {$:14}, false, _.to('V1', 'x', 'V2')); },
	function(_) { assert.equal(this.x.$, 2); _(); }, // x here represents the GCD of v1 and v2
    ], done)();
```

should return either v1 or v2 as V1, and the other as V2.

```js
var v1 = {$:Math.floor(Math.random() * 29) + 1};
    var v2 = {$:Math.floor(Math.random() * 29) + 1};
    util.seq([
	function(_) { versionGraph.getMergeStrategy(v1, v2, false, _.to('V1', 'x', 'V2')); },
	function(_) { assert(this.V1.$ == v1.$ || this.V1.$ == v2.$, 'V1 should be either v1 or v2: ' + this.V1.$);
		      assert(this.V2.$ == v1.$ || this.V2.$ == v2.$, 'V2 should be either v1 or v2: ' + this.V2.$);
		      assert(this.V1.$ != this.V2.$ || v1.$ == v2.$, 'V1 and V2 should not be the same one');
		      _();},
    ], done)();
```

should set V1 and V2 such that the path between x and V2 is lighter than from x to V1, given that resolve=false.

```js
var v1 = {$:Math.floor(Math.random() * 29) + 1};
    var v2 = {$:Math.floor(Math.random() * 29) + 1};
    util.seq([
	function(_) { versionGraph.getMergeStrategy(v1, v2, false, _.to('V1', 'x', 'V2')); },
	function(_) { assert((this.V1.$ * 1) >= (this.V2.$ * 1), 'V2 should be the lower of the two (closer to the GCD)');
		      _();},
    ], done)();
```

should set V1 and V2 to be v1 and v2 respectively if resolve=true.

```js
var v1 = {$:Math.floor(Math.random() * 29) + 1};
    var v2 = {$:Math.floor(Math.random() * 29) + 1};
    if((v1.$*1) > (v2.$*1)) {
	var tmp = v1;
	v1 = v2;
	v2 = tmp;
    }
    util.seq([
	function(_) { versionGraph.getMergeStrategy(v1, v2, true, _.to('V1', 'x', 'V2')); },
	function(_) { assert.equal(v1, this.V1);
		      assert.equal(v2, this.V2);
		      _();},
    ], done)();
```

<a name="simpleversiongraph-getpatchesv1-v2-cberr-patches"></a>
## .getPatches(v1, v2, cb(err, patches))
should return the patches along the path between v1 and v2 (here, v1 is an ancestor of v2).

```js
util.seq([
	function(_) { versionGraph.getPatches({$:2}, {$:18}, _.to('patches')); },
	function(_) { 
	    var m = 1;
	    for(var i = 0; i < this.patches.length; i++) {
		assert.equal(this.patches[i]._type, 'mult');
		m *= this.patches[i].amount;
	    }
	    assert.equal(m, 9);
	    _();
	},
    ], done)();
```

should expand patches that result from previous merges.

```js
var v1 = {$:Math.floor(Math.random() * 29) + 1};
    var v2 = {$:Math.floor(Math.random() * 29) + 1};
    util.seq([
	function(_) { versionGraph.getMergeStrategy(v1, v2, false, _.to('V1', 'x', 'V2', 'mergeInfo')); },
	function(_) { versionGraph.recordMerge(this.mergeInfo, {$:'newVersion'}, [], [], _); },
	function(_) { versionGraph.getPatches(v1, {$:'newVersion'}, _.to('patches')); },
	function(_) { 
	    var m = 1;
	    for(var i = 0; i < this.patches.length; i++) {
		assert.equal(this.patches[i]._type, 'mult');
		m *= this.patches[i].amount;
	    }
	    assert.equal(m, v2.$/this.x.$);
	    _();
	},
    ], done)();
```

<a name="simpleversiongraph-recordmergemergeinfo-newv-patches-confpatches-cberr"></a>
## .recordMerge(mergeInfo, newV, patches, confPatches, cb(err))
should record a merge using the mergeInfo object obtained from getMergeStrategy(), and a merged version.

```js
var v1 = {$:Math.floor(Math.random() * 29) + 1};
    var v2 = {$:Math.floor(Math.random() * 29) + 1};
    util.seq([
	function(_) { versionGraph.getMergeStrategy(v1, v2, false, _.to('V1', 'x', 'V2', 'mergeInfo')); },
	function(_) { versionGraph.recordMerge(this.mergeInfo, {$:'newVersion'}, [], [], _); },
	function(_) { versionGraph.getPatches(v1, {$:'newVersion'}, _); }, // The new version should be in the graph
    ], done)();
```

should record the overall weight on each new edge.

```js
var v1 = {$:Math.floor(Math.random() * 29) + 1};
    var v2 = {$:Math.floor(Math.random() * 29) + 1};
    var v3 = {$:Math.floor(Math.random() * 29) + 1};
    var v4 = {$:Math.floor(Math.random() * 29) + 1};
    util.seq([
	function(_) { versionGraph.getMergeStrategy(v1, v2, false, _.to('V1', 'x', 'V2', 'mergeInfo')); },
	function(_) { this.v12 = {$:v1.$ * v2.$ / this.x.$};
		      versionGraph.recordMerge(this.mergeInfo, this.v12, [], [], _); },
	function(_) { versionGraph.getMergeStrategy(v3, v4, false, _.to('V3', 'x', 'V4', 'mergeInfo')); },
	function(_) { this.v34 = {$:v3.$ * v4.$ / this.x.$};
		      versionGraph.recordMerge(this.mergeInfo, this.v34, [], [], _); },
	function(_) { versionGraph.getMergeStrategy(this.v12, this.v34, false, _.to('V5', 'x', 'V6')); },
	function(_) { assert(this.V6.$ <= this.V5.$, 'V6 should be lower'); _(); },
    ], done)();
```

should not record conflicting patches if such exist.

```js
var v1 = {$: 10};
    var v2 = {$: 24};
    
    util.seq([
	function(_) { versionGraph.getMergeStrategy(v1, v2, true, _.to('V1', 'x', 'V2', 'mergeInfo')); },
	function(_) { versionGraph.getPatches(this.x, v2, _.to('patches_x_v2')); },
	function(_) { versionGraph.recordMerge(this.mergeInfo, {$:'newVersion'}, [this.patches_x_v2[0]], this.patches_x_v2.slice(1), _); },
	function(_) { versionGraph.getPatches(v1, {$:'newVersion'}, _.to('patches_v1_new')); },
	function(_) { assert.deepEqual(this.patches_v1_new, [this.patches_x_v2[0]]); _(); },
	// The path from v2 to new should be like the one from x to v1, followed by the conflicting patches, inversed, in reverse order.
	function(_) { versionGraph.getPatches(this.x, v1, _.to('patches_x_v1')); },
	function(_) { versionGraph.getPatches(v2, {$:'newVersion'}, _.to('patches_v2_new')); },
	function(_) { assert.deepEqual(this.patches_v2_new, invertPatches(this.patches_x_v2.slice(1)).concat(this.patches_x_v1)); _(); },
    ], done)();
    function invertPatches(patches) {
	var inv = patches.map(function(p) { return {_type: 'inv', patch: p}; });
	return inv.reverse();
    }
```

<a name="util"></a>
# util
<a name="util-seqfuncs-done"></a>
## seq(funcs, done)
should return a function that runs asynchronous functions in funcs in order.

```js
var d;
var f = util.seq([
    function(_) {d = done; setTimeout(_, 10);},
    function(_) {d();}
], function() {});
f();
```

should handle errors by calling done with the error.

```js
util.seq([
    function(_) {_(new Error('someError'));},
    function(_) {assert(0, 'This should not be called'); _()}
], function(err) { assert.equal(err.message, 'someError'); done(); })();
```

should handle exceptions thrown by functions by calling done with the exception.

```js
util.seq([
    function(_) { throw new Error('someError');},
    function(_) {assert(0, 'This should not be called'); _()}
], function(err) { assert.equal(err.message, 'someError'); done(); })();
```

should call done with no error if all is successful.

```js
util.seq([
    function(_) {setTimeout(_, 10);},
    function(_) {setTimeout(_, 10);},
    function(_) {setTimeout(_, 10);}
], done)();
```

<a name="util-seqfuncs-done-_tonames"></a>
### _.to(names...)
should return a function that places the corresponding arguments in "this" (skipping err).

```js
util.seq([
    function(_) { _.to('a', 'b', 'c')(undefined, 1, 2, 3); },
    function(_) { assert.equal(this.a, 1); _(); },
    function(_) { assert.equal(this.b, 2); _(); },
    function(_) { assert.equal(this.c, 3); _(); },
], done)();
```

<a name="util-timeuid"></a>
## timeUid()
should return a unique string.

```js
var vals = {};
for(var i = 0; i < 10000; i++) {
    var tuid = util.timeUid();
    assert.equal(typeof(tuid), 'string');
    assert(!(tuid in vals), 'Value not unique');
    vals[tuid] = 1;
}
```

should return a larger value when called over one millisecond later.

```js
var a, b;
util.seq([
    function(_) { a = util.timeUid(); setTimeout(_, 2); },
    function(_) { b = util.timeUid(); setTimeout(_, 2); },
    function(_) { assert(b > a, 'Later value is not larger than earlier'); _();},
], done)();
```

<a name="util-encoderallowedspecial"></a>
## Encoder(allowedSpecial)
<a name="util-encoderallowedspecial-encodestr"></a>
### .encode(str)
should encode str in a way that will only include letters, digits or characters from allowedSpecial.

```js
var specialChars = '!@#$%^&*()_+<>?,./~`\'"[]{}\\|';
var allowed = '_-+';
var encoder = new util.Encoder(allowed);
var enc = encoder.encode('abc' + specialChars + 'XYZ');
for(var i = 0; i < specialChars.length; i++) {
    if(allowed.indexOf(specialChars.charAt(i)) != -1) continue; // Ignore allowed characters
    assert.equal(enc.indexOf(specialChars.charAt(i)), -1);
}
```

should throw an exception if less than three special characters are allowed.

```js
assert.throws(function() {
    util.encode('foo bar', '_+');
}, 'at least three special characters must be allowed');
```

<a name="util-encoderallowedspecial-decodeenc"></a>
### .decode(enc)
should decode a string encoded with .encode().

```js
var encoder = new util.Encoder(allowed);
var str = 'This is a test' + specialChars + ' woo hoo\n';
assert.equal(encoder.decode(encoder.encode(str)), str);
```

<a name="util-paralleln-callback"></a>
## parallel(n, callback)
should return a callback function that will call "callback" after it has been called n times.

```js
var c = util.parallel(100, done);
for(var i = 0; i < 200; i++) {
    setTimeout(c, 20);
}
```

should call the callback immediately with an error if an error is given to the parallel callback.

```js
var c = util.parallel(4, function(err) {
    assert(err, 'This should fail');
    done();
});
c();
c();
c(new Error('Some error'));
c(); // This will not call the callback
```

<a name="util-worker"></a>
## Worker
should call a given function iteratively, in given intervals, until stopped.

```js
var n = 0;
function f(callback) {
    n++;
    callback();
}
var worker = new util.Worker(f, 10 /*ms intervals*/);
worker.start();
setTimeout(util.protect(done, function() {
    worker.stop();
    assert(n >= 9 && n <= 11, 'n should be 10 +- 1 (' + n + ')');
    done();
}), 100);
```

should assure that no more than a given number of instances of the function are running at any given time.

```js
var n = 0;
function f(callback) {
    n++;
    setTimeout(callback, 50); // Each run will take 50 ms
}
var worker = new util.Worker(f, 10 /*ms intervals*/, 2 /* instances in parallel */);
worker.start();
setTimeout(util.protect(done, function() {
    worker.stop();
    // Two parallel 50 ms instances over 100 ms gives us 4 instances.
    assert(n >= 3 && n <= 5, 'n should be 4 +- 1 (' + n + ')');
    done();
}), 100);
```

<a name="util-repeat"></a>
## repeat
should repeat the given loop a given number of times, sending the iteration number to each invocation.

```js
var sum = 0;
util.seq([
    function(_) { util.repeat(10, 'foo', 0, function(_, i) { 
	sum += i; _(); 
    }, _); },
    function(_) { assert.equal(sum, 9 * 10 / 2); _(); /*1+2+3...+9*/ },
], done)();
```

<a name="util-depend"></a>
## depend
should execute the given callback functions in the order of their dependencies.

```js
util.depend([
    function(_) { _('a')(undefined, 2); },
    function(_) { _('b')(undefined, 3); },
    function(a, b, _) { _('c', 'd')(undefined, a+b, b-a); },
    function(c, d, _) { assert.equal(c, 5);
			assert.equal(d, 1);
			done(); },
], function(err) { done(err || new Error('This should not have been called')); });
```

should only call the callback once in the face of an exception.

```js
util.depend([
    function(_) { setTimeout(_('one', 'two'), 1); },
    function(one, _) { throw new Error('foo'); },
    function(two, _) { setTimeout(_('three'), 1); },
    function(three, _) { done(); },
], function(err) {
    assert(err, 'An error must be emitted');
    done(err.message == 'foo' ? undefined : err);
});
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

<a name="vercast-genidbucketid-hash"></a>
## .genID(bucketID, hash)
should create a version ID based on a bucket ID (string) and a hash (string).

```js
var id = vercast.genID('bucket', 'hash');
    assert.equal(id.$, 'bucket-hash');
    done();
```

<a name="vercast-bucketidid"></a>
## .bucketID(id)
should return the bucket ID associated with the given version ID.

```js
var id = vercast.genID('bucket', 'hash');
    assert.equal(vercast.bucketID(id), 'bucket');
    done();
```

<a name="vercast-objidid"></a>
## .objID(id)
should return the object hash part of the given version ID.

```js
var id = vercast.genID('bucket', 'hash');
    assert.equal(vercast.objID(id), 'hash');
    done();
```

<a name="vercast-childobjectsobj"></a>
## .childObjects(obj)
should return a list of sub-object IDs nested in obj.

```js
var obj = {left: vercast.genID('foo', 'bar'), right: vercast.genID('foo', 'baz'), value: 3};
    var children = vercast.childObjects(obj);
    assert.equal(children.length, 2);
    assert.equal(children[0].$, 'foo-bar');
    assert.equal(children[1].$, 'foo-baz');
    done();
```

should recursively search for children in nested objects and arrays.

```js
var obj = {
	subObj: {
	    list: [vercast.genID('foo', 'bar'), vercast.genID('foo', 'baz')], 
	    value: 3}
    };
    var children = vercast.childObjects(obj);
    assert.equal(children.length, 2);
    assert.equal(children[0].$, 'foo-bar');
    assert.equal(children[1].$, 'foo-baz');
    done();
```

<a name="vercast-randombykeykey-prob"></a>
## .randomByKey(key, prob)
should return true in probability prob.

```js
var numTrue = 0;
    var total = 1000;
    var prob = 0.2;
    for(var i = 0; i < total; i++) {
	var key = 'foo' + i;
	if(vercast.randomByKey(key, prob)) {
	    numTrue++;
	}
    }
    var mean = total * prob;
    var sigma = Math.sqrt(total * prob * (1 - prob));
    var USL = mean + 3*sigma;
    var LSL = mean - 3*sigma;
    assert(numTrue > LSL, 'numTrue must be more than ' + LSL);
    assert(numTrue < USL, 'numTrue must be less than ' + USL);
    done();
```

should behave consistently given a constant sequence of keys.

```js
var history = [];
    var total = 1000;
    var prob = 0.2;
    for(var i = 0; i < total; i++) {
	var key = 'foo' + i;
	history.push(vercast.randomByKey(key, prob));
    }
    for(var i = 0; i < total; i++) {
	var key = 'foo' + i;
	assert.equal(vercast.randomByKey(key, prob), history[i]);
    }
    done();
```

