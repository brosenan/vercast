# TOC
   - [application](#application)
     - [initialState](#application-initialstate)
     - [apply](#application-apply)
     - [inv](#application-inv)
   - [atom](#atom)
     - [get](#atom-get)
     - [set](#atom-set)
     - [get_all](#atom-get_all)
   - [BranchBase](#branchbase)
     - [.newBranch(branchName, s0, cb(err))](#branchbase-newbranchbranchname-s0-cberr)
     - [.query(branchName, state, cb(err, res))](#branchbase-querybranchname-state-cberr-res)
     - [.init(branchName, evaluator, args, cb(err))](#branchbase-initbranchname-evaluator-args-cberr)
     - [.trans(branch, patch, options, cb(err))](#branchbase-transbranch-patch-options-cberr)
     - [.merge(dest, source, options, cb(err))](#branchbase-mergedest-source-options-cberr)
   - [collection](#collection)
     - [init](#collection-init)
     - [add](#collection-add)
   - [composite patch](#composite-patch)
     - [apply](#composite-patch-apply)
       - [weak](#composite-patch-apply-weak)
     - [unapply](#composite-patch-unapply)
   - [counter](#counter)
     - [get](#counter-get)
     - [add](#counter-add)
   - [directory](#directory)
     - [create](#directory-create)
     - [delete](#directory-delete)
     - [get_hash](#directory-get_hash)
   - [DummyAtomicKVS](#dummyatomickvs)
     - [as AtomicKeyValue](#dummyatomickvs-as-atomickeyvalue)
       - [.newKey(key, val, cb(err))](#dummyatomickvs-as-atomickeyvalue-newkeykey-val-cberr)
       - [.retrieve(key, cb(err, val))](#dummyatomickvs-as-atomickeyvalue-retrievekey-cberr-val)
       - [.modify(key, oldVal, newVal, cb(err, valAfterMod))](#dummyatomickvs-as-atomickeyvalue-modifykey-oldval-newval-cberr-valaftermod)
   - [DummyBranch](#dummybranch)
     - [as Branch](#dummybranch-as-branch)
       - [checkedUpdate](#dummybranch-as-branch-checkedupdate)
   - [DummyVersionGraph](#dummyversiongraph)
     - [as VersionGraph](#dummyversiongraph-as-versiongraph)
       - [addEdge](#dummyversiongraph-as-versiongraph-addedge)
       - [findCommonAncestor](#dummyversiongraph-as-versiongraph-findcommonancestor)
   - [EvalEnv](#evalenv)
     - [init(evaluator, args, cb(err, h0))](#evalenv-initevaluator-args-cberr-h0)
     - [apply(s1, patch, unapply, cb(err, s2, res, eff, conf))](#evalenv-applys1-patch-unapply-cberr-s2-res-eff-conf)
     - [trans(h1, patch, cb(err, h2, res, eff, conf))](#evalenv-transh1-patch-cberr-h2-res-eff-conf)
     - [query(s, q, cb(err, res))](#evalenv-querys-q-cberr-res)
   - [HashDB](#hashdb)
     - [hash(obj, cb(err, hash))](#hashdb-hashobj-cberr-hash)
     - [unhash(hash, cb(err, obj))](#hashdb-unhashhash-cberr-obj)
   - [HashedApp](#hashedapp)
     - [initialState](#hashedapp-initialstate)
     - [apply](#hashedapp-apply)
       - [_inv](#hashedapp-apply-_inv)
       - [_comp](#hashedapp-apply-_comp)
       - [_hashed](#hashedapp-apply-_hashed)
     - [trans](#hashedapp-trans)
     - [query](#hashedapp-query)
     - [branchQuery](#hashedapp-branchquery)
     - [branchTrans](#hashedapp-branchtrans)
   - [inverse patch](#inverse-patch)
     - [patch](#inverse-patch-patch)
     - [unpatch](#inverse-patch-unpatch)
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
   - [VCObj](#vcobj)
     - [createObject(cls, s0, cb(err, h0))](#vcobj-createobjectcls-s0-cberr-h0)
     - [apply(h1, patch, cb(err, h2, res, effect, conflict))](#vcobj-applyh1-patch-cberr-h2-res-effect-conflict)
     - [invert(patch, cb(err, invPatch))](#vcobj-invertpatch-cberr-invpatch)
     - [createChainPatch(patches, cb(err, patch))](#vcobj-createchainpatchpatches-cberr-patch)
     - [trans(h1, patch, cb(h2, res, effect, conflict))](#vcobj-transh1-patch-cbh2-res-effect-conflict)
     - [query(h1, patch, cb(err, ret))](#vcobj-queryh1-patch-cberr-ret)
<a name=""></a>
 
<a name="application"></a>
# application
<a name="application-initialstate"></a>
## initialState
should properly create an initial state.

```js
var app = new App(hash);
util.seq([
		function(_) { app.initialState(appHashDB, _.to('s0')); },
		function(_) { assert.equal(this.s0.val, 0); _(); },
], done)();
```

<a name="application-apply"></a>
## apply
should return the query result based on the state.

```js
util.seq([
		function(_) { app.apply(state, {type: 'get'}, _.to('val', 'sf')); },
		function(_) { assert.equal(this.val, 0); _(); },
], done)();
```

should apply the patch to the state.

```js
util.seq([
		function(_) { app.apply(state, {type: 'add', amount:2}, _); },
		function(_) { app.apply(state, {type: 'get'}, _.to('val')); },
		function(_) { assert.equal(this.val, 2); _(); },
], done)();
```

<a name="application-inv"></a>
## inv
should invert patches.

```js
var app = new App(hash);
util.seq([
		function(_) { app.inv(appHashDB, {type: 'add', amount: 2}, _.to('inv')); },
		function(_) { assert.equal(this.inv.type, 'add');
			      assert.equal(this.inv.amount, -2); 
			      _();},
], done)();
```

<a name="atom"></a>
# atom
<a name="atom-get"></a>
## get
should return the atom's value.

```js
util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.query(this.s0, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'foo'); _(); },
], done)();
```

should return the last set value even at the event of a conflict.

```js
util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'set', from: 'foo', to: 'bar'}, _.to('s1')); },
		function(_) { evalEnv.trans(this.s1, {_type: 'set', from: 'foo', to: 'baz'}, _.to('s2')); },
		function(_) { evalEnv.query(this.s2, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'baz'); _(); },
], done)();
```

<a name="atom-set"></a>
## set
should change the state to contain the "to" value, given that the "from" value matches the current state.

```js
util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'set', from: 'foo', to: 'bar'}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
], done)();
```

should report a conflict if the "from" value does not match.

```js
util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'set', from: 'bar', to: 'baz'}, _.to('s1', 'res', 'eff', 'conf')); },
		function(_) { assert(this.conf, 'A conflict should be reported'); _(); },
], done)();
```

should invert patches correctly.

```js
util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'set', from: 'bar', to: 'foo'}, true, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
], done)();
```

<a name="atom-get_all"></a>
## get_all
should return all possible values.

```js
util.seq([
		function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'set', from: 'foo', to: 'bar'}, _.to('s1')); },
		function(_) { evalEnv.trans(this.s1, {_type: 'set', from: 'foo', to: 'baz'}, _.to('s2')); },
		function(_) { evalEnv.query(this.s2, {_type: 'get_all'}, _.to('res')); },
		function(_) { assert.deepEqual(this.res, ['baz', 'bar']); _(); },
], done)();
```

<a name="branchbase"></a>
# BranchBase
<a name="branchbase-newbranchbranchname-s0-cberr"></a>
## .newBranch(branchName, s0, cb(err))
should create a new branch with the given branchName, with the initial state s0.

```js
util.seq([
		function(_) { evalEnv.init('atom', {val: 'bar'}, _.to('s0')); },
		function(_) { branchBase.newBranch('foo', this.s0, _);  },
		function(_) { branchBase.query('foo', {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
], done)();
```

<a name="branchbase-initbranchname-evaluator-args-cberr"></a>
## .init(branchName, evaluator, args, cb(err))
should create a new branch with the given evaluator and arguments.

```js
util.seq([
		function(_) { branchBase.init('foo', 'atom', {val: 'bar'}, _); },
		function(_) { branchBase.query('foo', {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
], done)();
```

<a name="branchbase-transbranch-patch-options-cberr"></a>
## .trans(branch, patch, options, cb(err))
should apply the given patch on the tip of the given branch.

```js
var compPatch = {_type: 'comp', patches: [
		{_type: 'create', _path: ['a'], evalType: 'atom', args: {val: 'foo'}},
		{_type: 'create', _path: ['b'], evalType: 'atom', args: {val: 'bar'}},
		{_type: 'create', _path: ['c'], evalType: 'atom', args: {val: 'baz'}},
		{_type: 'set', _path: ['a'], from: 'foo', to: 'bat'},
]};
util.seq([
		function(_) { branchBase.init('br', 'dir', {}, _); },
		function(_) { branchBase.trans('br', compPatch, {}, _); },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['a']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bat'); _(); },
], done)();
```

should retry and reapply the patch over the new tip if the tip moves during the transition.

```js
util.seq([
		function(_) { branchBase.init('br', 'dir', {}, _); },
		function(_) { branchBase.trans('br', compPatch, {}, _); },
		function(_) { tipDB.retrieve('br', _.to('tip')); },
		function(_) { evalEnv.trans(this.tip, {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, _.to('s1')); },
		function(_) { var p = util.parallel(2, _);
			      branchBase.trans('br', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz2'}, {}, p);
			      tipDB.modify('br', this.tip, this.s1, p); // This will be done before the transition on c completes
			    },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.b, 'bar2'); // Both changes apply
			      assert.equal(this.c, 'baz2'); _(); },
], done)();
```

should retry the given number of times.

```js
util.seq([
		function(_) { branchBase.init('br', 'dir', {}, _); },
		function(_) { branchBase.trans('br', compPatch, {}, _); },
		function(_) { tipDB.retrieve('br', _.to('tip')); },
		function(_) { evalEnv.trans(this.tip, {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, _.to('s1')); },
		function(_) { var p = util.parallel(2, _);
			      branchBase.trans('br', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz2'}, {retries: 1}, p);
			      tipDB.modify('br', this.tip, this.s1, p); // This will be done before the transition on c completes
			    },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.b, 'bar2'); // Both changes apply
			      assert.equal(this.c, 'baz2'); _(); },
], function(err) {
		assert(err, 'An error needs to be emitted');
		done(err.message == 'Retries exhasted trying to modify state of branch br' ? undefined : err);
})();
```

should emit an error by default if the patch conflicts.

```js
util.seq([
		function(_) { branchBase.init('br', 'dir', {}, _); },
		function(_) { branchBase.trans('br', compPatch, {}, _); },
		function(_) { branchBase.trans('br', {_type: 'set', _path: ['a'], from: 'foo', to: 'bar'}, {}, _); },
], function(err) {
		assert(err, 'There should be an error');
		done(err.message == 'Conflicting change in transition on branch br' ? undefined : err);
})();
```

should force the change if the strong option is used.

```js
util.seq([
		function(_) { branchBase.init('br', 'dir', {}, _); },
		function(_) { branchBase.trans('br', compPatch, {}, _); },
		function(_) { branchBase.trans('br', {_type: 'set', _path: ['a'], from: 'foo', to: 'bar'}, {strong: true}, _); },
		function(_) { branchBase.query('br', {_type: 'get', _path: ['a']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
], done)();
```

<a name="branchbase-mergedest-source-options-cberr"></a>
## .merge(dest, source, options, cb(err))
should apply the patches contributing to source to the tip of branch.

```js
util.seq([
		function(_) { branchBase.init('br1', 'dir', {}, _); },
		function(_) { branchBase.trans('br1', compPatch, {}, _); },
		function(_) { branchBase.fork('br1', 'br2', _); },
		function(_) { branchBase.trans('br1', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz2'}, {}, _); },
		function(_) { branchBase.merge('br1', 'br2', {}, _); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.c, 'baz2'); _(); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { assert.equal(this.b, 'bar2'); _(); },
], done)();
```

should emit an error by default if a merge conflict is found.

```js
util.seq([
		function(_) { branchBase.init('br1', 'dir', {}, _); },
		function(_) { branchBase.trans('br1', compPatch, {}, _); },
		function(_) { branchBase.fork('br1', 'br2', _); },
		function(_) { branchBase.trans('br1', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar3'}, {}, _); },
		function(_) { branchBase.merge('br1', 'br2', {}, _); },
], function(err) {
		assert(err, 'An error must be emitted');
		done(err.message == 'Conflicting change in transition on branch br1' ? undefined : err);
})();
```

should accept a "weak" option, by which it would apply only non-conflicting changes.

```js
util.seq([
		function(_) { branchBase.init('br1', 'dir', {}, _); },
		function(_) { branchBase.trans('br1', compPatch, {}, _); },
		function(_) { branchBase.fork('br1', 'br2', _); },
		function(_) { branchBase.trans('br1', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['b'], from: 'bar', to: 'baz3'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz3'}, {}, _); },
		function(_) { branchBase.merge('br1', 'br2', {weak: true}, _); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.c, 'baz3'); _(); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { assert.equal(this.b, 'bar2'); _(); }, // The value on the destination branch
], done)();
```

should accept a "strong" option, by which it will force the change in case of a conflict.

```js
util.seq([
		function(_) { branchBase.init('br1', 'dir', {}, _); },
		function(_) { branchBase.trans('br1', compPatch, {}, _); },
		function(_) { branchBase.fork('br1', 'br2', _); },
		function(_) { branchBase.trans('br1', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar3'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz3'}, {}, _); },
		function(_) { branchBase.merge('br1', 'br2', {strong: true}, _); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.c, 'baz3'); _(); },
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { assert.equal(this.b, 'bar3'); _(); }, // The value on the source branch
], done)();
```

should apply a back-merge correctly.

```js
util.seq([
		function(_) { branchBase.init('br1', 'dir', {}, _); },
		function(_) { branchBase.trans('br1', compPatch, {}, _); },
		function(_) { branchBase.fork('br1', 'br2', _); },
		function(_) { branchBase.trans('br1', {_type: 'set', _path: ['b'], from: 'bar', to: 'bar2'}, {}, _); },
		function(_) { branchBase.trans('br2', {_type: 'set', _path: ['c'], from: 'baz', to: 'baz2'}, {}, _); },
		function(_) { branchBase.merge('br1', 'br2', {}, _); },
		function(_) { branchBase.merge('br2', 'br1', {}, _); }, // merge back
		// Check that br1 got the data from br2
		function(_) { branchBase.query('br1', {_type: 'get', _path: ['c']}, _.to('c')); },
		function(_) { assert.equal(this.c, 'baz2'); _(); },
		// Check that br2 got the data from br1
		function(_) { branchBase.query('br2', {_type: 'get', _path: ['b']}, _.to('b')); },
		function(_) { assert.equal(this.b, 'bar2'); _(); },
], done)();
```

<a name="collection"></a>
# collection
<a name="collection-init"></a>
## init
should create an empty collection.

```js
util.seq([
		function(_) { evalEnv.init('coll', {}, _.to('s0')); },
		function(_) { evalEnv.query(this.s0, {_type: 'get'}, _.to('res')); },
		function(_) { assert.deepEqual(this.res, {}); _(); },
], done)();
```

<a name="collection-add"></a>
## add
should add a key/value pair to the collection.

```js
util.seq([
		function(_) { evalEnv.init('coll', {}, _.to('state')); },
		function(_) { evalEnv.trans(this.state, {_type: 'add', key: 'foo', val: 'bar'}, _.to('state')); },
		function(_) { evalEnv.query(this.state, {_type: 'get'}, _.to('res')); },
		function(_) { assert.deepEqual(this.res, {foo: 'bar'}); _(); },
], done)();
```

<a name="composite-patch"></a>
# composite patch
<a name="composite-patch-apply"></a>
## apply
should apply the given patches one by one.

```js
util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'comp', patches: [
		    {_type: 'add', amount: 2},
		    {_type: 'add', amount: 2},
		    {_type: 'add', amount: 2},
		    {_type: 'add', amount: 2},
		]}, false, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 8); _(); },
], done)();
```

should return an array of the underlying results.

```js
util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'comp', patches: [
		    {_type: 'add', amount: 2},
		    {_type: 'get'},
		    {_type: 'add', amount: 2},
		    {_type: 'get'},
		]}, false, _.to('s1', 'res')); },
		function(_) { assert.deepEqual(this.res, [undefined, 2, undefined, 4]); _(); },
], done)();
```

should return no result if none of the underlying patches return result.

```js
util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'comp', patches: [
		    {_type: 'add', amount: 1},
		    {_type: 'add', amount: 2},
		    {_type: 'add', amount: 3},
		    {_type: 'add', amount: 4},
		    {_type: 'add', amount: 5},
		]}, false, _.to('s1', 'res')); },
		function(_) { assert.equal(typeof this.res, 'undefined'); _(); },
], done)();
```

<a name="composite-patch-apply-weak"></a>
### weak
should not apply conflicting patches.

```js
util.seq([
    function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
    function(_) { evalEnv.trans(this.s0, {_type: 'comp', weak: true, patches: [
	{_type: 'set', from: 'foo', to: 'bar'},
	{_type: 'set', from: 'foo', to: 'baz'},
    ]}, _.to('s1', 'res', 'eff', 'conf')); },
    function(_) { assert(!this.conf, 'A weak patch should not be reported as conflicting'); _(); },
    function(_) { evalEnv.query(this.s1, {_type: 'get_all'}, _.to('res')); },
    // Only the non-conflicting change should be performed
    function(_) { assert.deepEqual(this.res, ['bar']); _(); },
], done)();
```

should report the conflicting patch in the results.

```js
var confPatch = {_type: 'set', from: 'foo', to: 'baz'};
util.seq([
    function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
    function(_) { evalEnv.trans(this.s0, {_type: 'comp', weak: true, patches: [
	{_type: 'set', from: 'foo', to: 'bar'},
	confPatch,
    ]}, _.to('s1', 'res')); },
    function(_) { assert.deepEqual(this.res, [undefined, {$badPatch: confPatch}]); _(); },
], done)();
```

should provide $badPatch in nested patches.

```js
var confPatch = {_type: 'set', from: 'foo', to: 'baz'};
var confPatchWrapper = {_type: 'comp', weak: true, patches: [confPatch]};
util.seq([
    function(_) { evalEnv.init('atom', {val: 'foo'}, _.to('s0')); },
    function(_) { evalEnv.trans(this.s0, {_type: 'comp', weak: true, patches: [
	{_type: 'set', from: 'foo', to: 'bar'},
	confPatchWrapper,
    ]}, _.to('s1', 'res')); },
    function(_) { assert.deepEqual(this.res, [undefined, [{$badPatch: confPatch}]]); _(); },
], done)();
```

<a name="composite-patch-unapply"></a>
## unapply
should unapply the given patches in reverse order.

```js
util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'comp', patches: [
		    {_type: 'add', amount: 2},
		    {_type: 'get'},
		    {_type: 'add', amount: 3},
		    {_type: 'get'},
		]}, true, _.to('s1', 'res')); },
		function(_) { assert.deepEqual(this.res, [0, undefined, -3, undefined]); _(); },
], done)();
```

<a name="counter"></a>
# counter
<a name="counter-get"></a>
## get
should initially return 0.

```js
util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'get'}, false, _.to('s1', 'val')); },
		function(_) { hashDB.hash(this.s0, _.to('h0')); },
		function(_) { hashDB.hash(this.s1, _.to('h1')); },
		function(_) {
		    assert.deepEqual(this.h1, this.h0, 'get should not change the state');
		    assert.equal(this.val, 0);
		    _();
		},
], done)();
```

<a name="counter-add"></a>
## add
should increase the counter value by the given amount.

```js
util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'add', amount: 2}, false, _.to('s1')); },
		function(_) { evalEnv.apply(this.s1, {_type: 'get'}, false, _.to('s2', 'val')); },
		function(_) {
		    assert.equal(this.val, 2);
		    _();
		},
], done)();
```

should be reversible.

```js
util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'add', amount: 2}, true, _.to('s1')); },
		function(_) { evalEnv.apply(this.s1, {_type: 'get'}, false, _.to('s2', 'res')); },
		function(_) { assert.equal(this.res, -2); _(); },
], done)();
```

<a name="directory"></a>
# directory
should propagate any patches it does not handle itself to child objects.

```js
util.seq([
    function(_) { evalEnv.init('dir', {}, _.to('s0')); },
    function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
    function(_) { evalEnv.trans(this.s1, {_type: 'set', _path: ['foo'], from: 'bar', to: 'baz'}, _.to('s2')); },
    function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _.to('res')); },
    function(_) { assert.equal(this.res, 'baz'); _(); },
], done)();
```

should propagate unapplied patches as well as applied.

```js
util.seq([
    function(_) { evalEnv.init('dir', {}, _.to('s0')); },
    function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'baz'}}, _.to('s1')); },
    function(_) { evalEnv.apply(this.s1, {_type: 'set', _path: ['foo'], from: 'bar', to: 'baz'}, true, _.to('s2')); },
    function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _.to('res')); },
    function(_) { assert.equal(this.res, 'bar'); _(); },
], done)();
```

<a name="directory-create"></a>
## create
should create a child node using the given evaluator type and arguments.

```js
util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get', _path: ['foo']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
], done)();
```

should delete a child when unapplied.

```js
util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.apply(this.s1, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, true, _.to('s2', 'res', 'eff', 'conf')); },
		function(_) { assert(!this.conf, 'should not be conflicting'); _(); },
		function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _); },
], function(err) {
		assert(err, 'an error should be emitted');
		done((err.message != 'Invalid path: foo' && err) || undefined);
})();
```

should report a conflict when unpatched if the child state does not match the construction parameters.

```js
util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.trans(this.s1, {_type: 'set', _path: ['foo'], from: 'bar', to: 'baz'}, _.to('s2')); },
		function(_) { evalEnv.apply(this.s2, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, true, _.to('s3', 'res', 'eff', 'conf')); },
		function(_) { assert(this.conf, 'should be conflicting'); _(); },
], done)();
```

<a name="directory-delete"></a>
## delete
should remove the object at the given path from the directory.

```js
util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get_hash', _path: ['foo']}, _.to('childHash')); },
		function(_) { evalEnv.trans(this.s1, {_type: 'delete', _path: ['foo'], hash: this.childHash}, _.to('s2')); },
		function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _); },
], function(err) {
		assert(err, 'an error should be emitted');
		done((err.message != 'Invalid path: foo' && err) || undefined);
})();
```

should report a conflic if the removed child state does not match the given hash.

```js
util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get_hash', _path: ['foo']}, _.to('beforeChange')); },
		function(_) { evalEnv.trans(this.s1, {_type: 'set', _path: ['foo'], from: 'bar', to: 'baz'}, _.to('s2')); },
		function(_) { evalEnv.trans(this.s2, {_type: 'delete', _path: ['foo'], hash: this.beforeChange}, _.to('s3', 'res', 'eff', 'conf')); },
		function(_) { assert(this.conf, 'should be conflicting'); _(); },
], done)();
```

should re-create a child if unapplied.

```js
util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.init('atom', {val: 'bar'}, _.to('child')); },
		function(_) { hashDB.hash(this.child, _.to('child')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'delete', _path: ['foo'], hash: this.child}, true, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get', _path: ['foo']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
], done)();
```

should conflict when unapplied if the child already exists.

```js
util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.init('atom', {val: 'bar'}, _.to('child')); },
		function(_) { hashDB.hash(this.child, _.to('child')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: '!@#!@#'}}, _.to('s1')); },
		function(_) { evalEnv.apply(this.s1, {_type: 'delete', _path: ['foo'], hash: this.child}, true, _.to('s2', 'res', 'eff', 'conf')); },
		function(_) { assert(this.conf, 'should be conflicting'); _(); },
		function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
], done)();
```

<a name="directory-get_hash"></a>
## get_hash
should return the hash of the child at the given path.

```js
util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get_hash', _path: ['foo']}, _.to('child')); },
		function(_) { evalEnv.query(this.child, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
], done)();
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

<a name="dummybranch"></a>
# DummyBranch
<a name="dummybranch-as-branch"></a>
## as Branch
<a name="dummybranch-as-branch-checkedupdate"></a>
### checkedUpdate
should update the branch state if given that the state condition is met.

```js
util.seq([
    function(_) { branch.checkedUpdate('root', 's1', _); },
    function(_) { branch.tip(_.to('tip')); },
    function(_) { assert.equal(this.tip, 's1'); _(); },
], done)();
```

should return the tip state before modification.

```js
util.seq([
    function(_) { branch.checkedUpdate('root', 's1', _.to('shouldBeRoot')); },
    function(_) { assert.equal(this.shouldBeRoot, 'root'); _(); },
    function(_) { branch.tip(_.to('tip')); },
    function(_) { assert.equal(this.tip, 's1'); _(); },
], done)();
```

should not update the branch state if the first argument does not match the current tip value.

```js
util.seq([
    function(_) { branch.checkedUpdate('foo', 's1', _); },
    function(_) { branch.tip(_.to('tip')); },
    function(_) { assert.equal(this.tip, 'root'); _(); },
], done)();
```

<a name="dummyversiongraph"></a>
# DummyVersionGraph
<a name="dummyversiongraph-as-versiongraph"></a>
## as VersionGraph
<a name="dummyversiongraph-as-versiongraph-addedge"></a>
### addEdge
should accept an edge and add it to the graph.

```js
util.seq([
    function(_) { versionGraph.addEdge("foo", "likes", "bar", _); },
    function(_) { versionGraph.queryEdge("foo", "likes", _.to('shouldBeBar')); },
    function(_) { assert.equal(this.shouldBeBar, 'bar'); _(); },
], done)();
```

should create a dual mapping, mapping also the destination to the source.

```js
util.seq([
    function(_) { versionGraph.addEdge("foo", "likes", "bar", _); },
    function(_) { versionGraph.queryBackEdge("bar", "likes", _.to('shouldBeFoo')); },
    function(_) { assert.equal(this.shouldBeFoo, 'foo'); _(); },
], done)();
```

<a name="dummyversiongraph-as-versiongraph-findcommonancestor"></a>
### findCommonAncestor
should find the common ancestor of two nodes, and the path to each of them.

```js
util.seq([
    function(_) { versionGraph.addEdge('terah', 'p1', 'abraham', _); },
    function(_) { versionGraph.addEdge('abraham', 'p2', 'isaac', _); },
    function(_) { versionGraph.addEdge('isaac', 'p3', 'jacob', _); },
    function(_) { versionGraph.addEdge('jacob', 'p4', 'joseph', _); },
    function(_) { versionGraph.addEdge('abraham', 'p5', 'ismael', _); },
    function(_) { versionGraph.addEdge('isaac', 'p6', 'esaw', _); },
    function(_) { versionGraph.addEdge('jacob', 'p7', 'simon', _); },
    function(_) { versionGraph.findCommonAncestor('simon', 'ismael', _.to('ancestor', 'path1', 'path2')); },
    function(_) { assert.equal(this.ancestor, 'abraham'); _(); },
], done)();
```

should handle the case where there are also common descendants.

```js
util.seq([
    function(_) { createGraph(1, 1, 30, _); },
    function(_) { versionGraph.findCommonAncestor(4, 6, _.to('ancestor', 'p1', 'p2')); },
    function(_) { assert.equal(this.ancestor, 2); _(); },
], done)();
```

should return the path from the common ancestor to both nodes.

```js
util.seq([
    function(_) { createGraph(1, 1, 30, _); },
    function(_) { versionGraph.findCommonAncestor(8, 10, _.to('ancestor', 'p1', 'p2')); },
    function(_) { assert.equal(this.ancestor, 2); _(); },
    function(_) { assert.deepEqual(this.p1, ['2', '2']); _(); },
    function(_) { assert.deepEqual(this.p2, ['5']); _(); },
], done)();
```

<a name="evalenv"></a>
# EvalEnv
<a name="evalenv-initevaluator-args-cberr-h0"></a>
## init(evaluator, args, cb(err, h0))
should return a hash to an object constructed by the evaluator's init() method.

```js
var evaluators = {foo: {
		init: function(args, ctx) {
		    ctx.ret({bar: args.bar, baz: 2});
		}
}};
var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
util.seq([
		function(_) { evalEnv.init('foo', {bar: 3}, _.to('h0')); },
		function(_) { assert(this.h0.$hash$, 'h0 must be a hash'); hashDB.unhash(this.h0, _.to('s0')); },
		function(_) { assert.deepEqual(this.s0, {_type: 'foo', bar: 3, baz: 2}); _(); },
], done)();
```

should pass the evaluator as the "this" of the called method.

```js
var evaluators = {
		foo: {
		    init: function(args, ctx) {
			ctx.ret({val: this.def});
		    },
		    def: 100,
		},
};
var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('s0')); },
		function(_) { hashDB.unhash(this.s0, _.to('s0')); },
		function(_) { assert.equal(this.s0.val, 100); _(); },
], done)();
```

<a name="evalenv-applys1-patch-unapply-cberr-s2-res-eff-conf"></a>
## apply(s1, patch, unapply, cb(err, s2, res, eff, conf))
should apply patch to s1 by invoking the evaluator's apply method, to retrieve s2 and res.

```js
var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:0}); },
		apply: function(s1, patch, unapply, ctx) { assert.equal(patch._type, 'bar');
							   var old = s1.val;
							   s1.val += patch.amount; 
							   ctx.ret(s1, old); },
}};
var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.apply(this.h0, {_type: 'bar', amount: 2}, false, _.to('h1', 'res')); },
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.deepEqual(this.s1, {_type: 'foo', val: 2});
			      assert.equal(this.res, 0); _();},
], done)();
```

should use the patch evaluator if one exists for the patch type.

```js
var evaluators = { 
		foo: {
		    init: function(args, ctx) { ctx.ret({val:0}); },
		    apply: function(s1, patch, unapply, ctx) { var old = s1.val;
							       s1.val += patch.amount; 
							       ctx.ret(s1, old); },
		},
		bar: { 
		    apply: function(s1, patch, unapply, ctx) {
			var old = s1.val;
			s1.val -= patch.amount; // Does the opposite
			ctx.ret(s1, old); 
		    }
		},
};
var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.apply(this.h0, {_type: 'bar', amount: 2}, false, _.to('h1', 'res')); },
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.deepEqual(this.s1, {_type: 'foo', val: -2});
			      assert.equal(this.res, 0); _();},
], done)();
```

should pass the evaluator as the "this" of the called method.

```js
var evaluators = {
		foo: {
		    init: function(args, ctx) {
			ctx.ret({val: 0});
		    },
		    apply: function(s1, patch, unapply, ctx) {
			s1.val += this.amount;
			ctx.ret(s1);
		    },
		    amount: 50,
		},
};
var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {}, false, _.to('s1')); },
		function(_) { hashDB.unhash(this.s1, _.to('s1')); },
		function(_) { assert.equal(this.s1.val, 50); _(); },
], done)();
```

should report a conflict if a propagated patch conflicted.

```js
var evaluators = {
		atom: require('../atom.js'),
		dir: require('../dir.js'),
		comp: require('../composite.js'),
};

var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'comp', patches: [
		    {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}},
		    {_type: 'set', _path: ['foo'], from: 'baz', to: 'bat'}, // This is conflicting
		]}, _.to('s1', 'res', 'eff', 'conf')); },
		function(_) { assert(this.conf, 'should be conflicting'); _(); },
], done)();
```

<a name="evalenv-transh1-patch-cberr-h2-res-eff-conf"></a>
## trans(h1, patch, cb(err, h2, res, eff, conf))
should apply the patch.

```js
var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:0}); },
		apply: function(s1, patch, unapply, ctx) { var old = s1.val;
							   s1.val += patch.amount; 
							   ctx.ret(s1, old); },
}};
var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.trans(this.h0, {_type: 'bar', amount: 2}, _.to('h1', 'res')); },
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.deepEqual(this.s1, {_type: 'foo', val: 2});
			      assert.equal(this.res, 0); _();},
], done)();
```

should avoid repeating calculations already done.

```js
var count = 0;
var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:0}); },
		apply: function(s1, patch, unapply, ctx) { s1.val += patch.amount;
							   count++; // Side effect: count the number of calls
							   ctx.ret(s1); },
}};
var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.trans(this.h0, {_type: 'bar', amount: 2}, _.to('h1')); },
		function(_) { evalEnv.trans(this.h1, {_type: 'bar', amount: -2}, _.to('h2')); },
		function(_) { evalEnv.trans(this.h2, {_type: 'bar', amount: 2}, _.to('h3')); },
		function(_) { evalEnv.trans(this.h3, {_type: 'bar', amount: -2}, _.to('h4')); },
		function(_) { evalEnv.trans(this.h4, {_type: 'bar', amount: 2}, _.to('h5')); },
		function(_) { evalEnv.trans(this.h5, {_type: 'bar', amount: -2}, _.to('h6')); },
		function(_) { evalEnv.trans(this.h6, {_type: 'bar', amount: 2}, _.to('h7')); },
		function(_) { evalEnv.trans(this.h7, {_type: 'bar', amount: -2}, _.to('h8')); },
		function(_) { assert.equal(count, 2); _(); },
], done)();
```

<a name="evalenv-querys-q-cberr-res"></a>
## query(s, q, cb(err, res))
should apply query patch q to object with state s, emitting res.

```js
var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:args.val}); },
		apply: function(s, query, unapply, ctx) { if(query._type == 'get') { ctx.ret(s, s.val); } },
}};
var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
util.seq([
		function(_) { evalEnv.init('foo', {val:7}, _.to('h0')); },
		function(_) { evalEnv.query(this.h0, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 7); _();},
], done)();
```

should emit an error if the query changes the state.

```js
var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:0}); },
		apply: function(s1, patch, unapply, ctx) { var old = s1.val;
							   s1.val += patch.amount; 
							   ctx.ret(s1, old); },
}};
var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.query(this.h0, {_type: 'bar', amount: 2}, _); },
], function(err) {
		if(!err) {
		    done(new Error('Error not emitted'));
		} else if(err.message == 'Query patch bar changed object state') {
		    done();
		} else {
		    done(err);
		}
})();
```

should do the opposite of applying patch to s1. Applying patch to s2 should result in s1, given that conf is false.

```js
var evaluators = { foo: {
		init: function(args, ctx) { ctx.ret({val:0}); },
		apply: function(s1, patch, unapply, ctx) { 
		    var old = s1.val;
		    if(!unapply) {
			s1.val += patch.amount; 
		    } else {
			s1.val -= patch.amount;
		    }
			ctx.ret(s1, old); 
		},
}};
var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
var patch = {_type: 'bar', amount: 2};
util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); },
		function(_) { evalEnv.apply(this.h0, patch, false, _.to('h1')); },
		function(_) { evalEnv.apply(this.h1, patch, true, _.to('h2')); },
		function(_) { hashDB.hash(this.h2, _.to('h2')); },
		function(_) { assert.equal(this.h2.$hash$, this.h0.$hash$); _(); },
], done)();
```

should use the unpatch evaluator if one exists for the patch type.

```js
var evaluators = { 
		foo: {
		    init: function(args, ctx) { ctx.ret({val:0}); },
		    apply: function(s1, patch, unapply, ctx) { 
			var old = s1.val;
			if(!unapply) {
			    s1.val += patch.amount; 
			} else {
			    s1.val -= patch.amount; 
			}
			ctx.ret(s1, old); 
		    }
		},
		bar: {
		    apply: function(s1, patch, unapply, ctx) { 
			var old = s1.val;
			if(!unapply) {
			    s1.val += patch.amount * 2; 
			} else {
			    s1.val -= patch.amount * 2;
			}
			ctx.ret(s1, old); 
		    }
		},
};
var evalEnv = new EvalEnv(hashDB, kvs, evaluators);
var patch = {_type: 'bar', amount: 2};
util.seq([
		function(_) { evalEnv.init('foo', {}, _.to('h0')); }, // 0
		function(_) { evalEnv.apply(this.h0, patch, true, _.to('h1')); }, // -4
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.equal(this.s1.val, -4); _(); },
], done)();
```

<a name="hashdb"></a>
# HashDB
should store its own copy of the object.

```js
var hashDB = new HashDB(new DummyKVS());
var obj = {foo: 'bar', count: [1, 2, 3]};
util.seq([
    function(_) { hashDB.hash(obj, _.to('h')); },
    function(_) { obj.foo = 'baz'; _(); },
    function(_) { hashDB.unhash(this.h, _.to('obj')); },
    function(_) { assert.equal(this.obj.foo, 'bar'); _(); },
], done)();
```

<a name="hashdb-hashobj-cberr-hash"></a>
## hash(obj, cb(err, hash))
should give any two different JSONable objects a different hash code.

```js
var hashDB = new HashDB(new DummyKVS());
var obj1 = {foo: 'bar', count: [1, 2, 3]};
var obj2 = {foo: 'bar', count: [1, 2, 4]};
util.seq([
		function(_) { hashDB.hash(obj1, _.to('h1')); },
		function(_) { hashDB.hash(obj2, _.to('h2')); },
		function(_) {
		    assert.equal(typeof this.h1.$hash$, 'string');
		    assert.equal(typeof this.h2.$hash$, 'string');
		    assert(this.h1.$hash$ != this.h2.$hash$, 'hash objects should differ');
		    _();
		},
], done)();
```

should act as an identity function when given a hash as input.

```js
var hashDB = new HashDB(new DummyKVS());
var obj = {foo: 'bar', count: [1, 2, 3]};
util.seq([
		function(_) { hashDB.hash(obj, _.to('h1')); },
		function(_) { hashDB.hash(this.h1, _.to('h2')); },
		function(_) { assert.deepEqual(this.h1, this.h2); _(); },
], done)();
```

<a name="hashdb-unhashhash-cberr-obj"></a>
## unhash(hash, cb(err, obj))
should reconstruct an object from the hash that is identical to the origianl object.

```js
var hashDB = new HashDB(new DummyKVS());
var obj = {foo: 'bar', count: [1, 2, 3]};
util.seq([
		function(_) { hashDB.hash(obj, _.to('h')); },
		function(_) { hashDB.unhash(this.h, _.to('obj')); },
		function(_) { assert.deepEqual(this.obj, obj); _(); },
], done)();
```

should act as an identity when given a non-hash object as input.

```js
var hashDB = new HashDB(new DummyKVS());
var obj = {foo: 'bar', count: [1, 2, 3]};
util.seq([
		function(_) { hashDB.unhash(obj, _.to('obj')); },
		function(_) { assert.deepEqual(obj, this.obj); _(); },
], done)();
```

<a name="hashedapp"></a>
# HashedApp
<a name="hashedapp-initialstate"></a>
## initialState
should return the initial state's hash.

```js
var app = new HashedApp(new App(hash), hash);
util.seq([
		function(_) { app.initialState(appHash, _.to('h0')); },
		function(_) { assert.equal(typeof this.h0.$hash$, 'string'); _(); },
		function(_) { hash.unhash(this.h0, _.to('s0')); },
		function(_) { assert.equal(this.s0.val, 0); _(); },
], done)();
```

<a name="hashedapp-apply"></a>
## apply
should calculate the hash of the new state, the computation result and the safety flag, based on an original state and a patch.

```js
util.seq([
		function(_) { app.apply(h0, {type: 'add', amount: 2}, _.to('h1', 'r1', 'sf1')); },
		function(_) { assert(this.sf1, 'sf must be true'); _(); },
		function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
		function(_) { assert(this.sf2, 'sf must be true');
			      assert.equal(this.r2, 2);
			      assert.equal(this.h2.$hash$, this.h1.$hash$);
			      _();},
		function(_) { app.apply(this.h2, {type: 'add', amount: -2}, _.to('h3', 'r3', 'sf3')); },
		function(_) { assert.equal(this.h3.$hash$, h0.$hash$); _(); },
], done)();
```

<a name="hashedapp-apply-_inv"></a>
### _inv
should handle _inv patches.

```js
util.seq([
    function(_) { app.apply(h0, {type: '_inv', patch: {type: 'add', amount: 2}}, _.to('h1', 'r1', 'sf1')); },
    function(_) { assert(this.sf1, 'inverted operation should be safe'); _(); },
    function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
    function(_) { assert.equal(this.r2, -2); _(); },
], done)();
```

should support _inv of _inv patches.

```js
util.seq([
    function(_) { app.apply(h0, {type: '_inv', patch: 
				 {type: '_inv', patch: 
				  {type: 'add', amount: 2}}}, _.to('h1', 'r1', 'sf1')); },
    function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
    function(_) { 
	assert(this.sf1, 'sf1');
	assert(this.sf2, 'sf2');
	assert.equal(this.r2, 2); 
	_(); 
    },
], done)();
```

<a name="hashedapp-apply-_comp"></a>
### _comp
should handle _comp patches.

```js
util.seq([
    function(_) { app.apply(h0, {type: '_comp', patches: [{type: 'add', amount: 1}, 
							  {type: 'add', amount: 2}, 
							  {type: 'add', amount: 3}]}, _.to('h1', 'r1', 'sf1')); },
    function(_) { assert(this.sf1, 'composite operation should be safe'); _(); },
    // The result should be an array of the same size as the patches array.
    // The values in the arrays may either be the results of the applied patches, or undefined.
    function(_) { assert.equal(this.r1.length, 3); _(); },
    function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
    function(_) { assert.equal(this.r2, 6); _(); },
], done)();
```

should support _inv of _comp patches.

```js
util.seq([
    function(_) { app.apply(h0, {type: '_inv', patch: 
				 {type: '_comp', patches: [
				     {type: 'add', amount: 1}, 
				     {type: 'add', amount: 2}, 
				     {type: 'add', amount: 3}]}}, _.to('h1', 'r1', 'sf1')); },
    function(_) { assert(this.sf1, 'composite operation should be safe'); _(); },
    function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
    function(_) { assert.equal(this.r2, -6); _(); },
], done)();
```

should replace the output from patches that were not safely applied with an object containing a $badPatch field, containing the patch.

```js
util.seq([
    function(_) { app.apply(h0, {type: '_comp', patches: [
	{type: 'set', from: 0, to: 2},
	{type: 'set', from: 100, to: 101}, // This cannot be safely applied
	{type: 'add', amount: 2}
    ]}, _.to('h1', 'r1', 'sf1')); },
    function(_) { assert(!this.sf1, 'applied patch should not be reported safe'); _(); },
    function(_) { assert.deepEqual(this.r1[1].$badPatch, {type: 'set', from: 100, to: 101}); _(); },
    function(_) { assert.equal(this.r1[1].res, 2); _(); }, // The original result
    function(_) { app.query(this.h1, {type: 'get'}, _.to('result')); },
    function(_) { assert.equal(this.result, 103); _(); },
], done)();
```

should support a "weak" flag, which when exists and true, avoids execution of unsafe sub-patches.

```js
util.seq([
    function(_) { app.apply(h0, {type: '_comp', weak: true, patches: [
	{type: 'set', from: 0, to: 2},
	{type: 'set', from: 100, to: 101}, // This should not take effect
	{type: 'add', amount: 2}
    ]}, _.to('h1', 'r1', 'sf1')); },
    function(_) { assert(this.sf1, 'applied patch should be safe'); _(); },
    function(_) { assert.deepEqual(this.r1[1].$badPatch, {type: 'set', from: 100, to: 101}); _(); },
    function(_) { app.query(this.h1, {type: 'get'}, _.to('result')); },
    function(_) { assert.equal(this.result, 4); _(); },
], done)();
```

<a name="hashedapp-apply-_hashed"></a>
### _hashed
should handle _hashed patches.

```js
util.seq([
    function(_) { hash.hash({type: 'add', amount: 3}, _.to('ph')); },
    function(_) { app.apply(h0, {type: '_hashed', hash: this.ph}, _.to('h1', 'r1', 'sf1')); },
    function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
    function(_) { assert.equal(this.r2, 3); _(); },
], done)();
```

should support _inv of _hashed.

```js
var patch = {type: 'add', amount: 5};
util.seq([
    function(_) { hash.hash(patch, _.to('hp')); },
    function(_) { app.apply(h0, {type: '_inv', patch: {type: '_hashed', hash: this.hp}}, _.to('h1', 'r1', 'sf1')); },
    function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
    function(_) { assert.equal(this.r2, -5); _(); },
], done)();
```

<a name="hashedapp-trans"></a>
## trans
should return the hash of the target state when given a source state and a patch.

```js
util.seq([
		function(_) { app.trans(h0, {type: 'add', amount: 3}, _.to('h1', 'r1', 'sf1')); },
		function(_) { assert(this.sf1, 'add operation should be safe'); _(); },
		function(_) { app.apply(this.h1, {type: 'get'}, _.to('h1', 'r1')); },
		function(_) { assert.equal(this.r1, 3); _(); },
		function(_) { app.trans(this.h1, {type: 'add', amount: -3}, _.to('h2', 'r2', 'sf2')); },
		function(_) { assert.equal(this.h2.$hash$, h0.$hash$); _(); },
], done)();
```

should cache previous calls and only invoke the actual method if the combination of input state and patch have not yet been encountered.

```js
process._counter = 0; // The counter's 'add' method increments this counter as a side effect.
util.seq([
		function(_) { app.trans(h0, {type: 'add', amount: 3}, _.to('h1', 'r1', 'sf1')); },
		function(_) { app.trans(this.h1, {type: 'add', amount: -3}, _.to('h2', 'r2', 'sf2')); },
		function(_) { app.trans(this.h2, {type: 'add', amount: 3}, _.to('h3', 'r3', 'sf3')); },
		function(_) { app.trans(this.h3, {type: 'add', amount: -3}, _.to('h4', 'r4', 'sf4')); },
		function(_) { app.trans(this.h4, {type: 'add', amount: 3}, _.to('h5', 'r5', 'sf5')); },
		function(_) { app.trans(this.h5, {type: 'add', amount: -3}, _.to('h6', 'r6', 'sf6')); },
		function(_) { assert(this.sf6, 'all operations should be safe'); _(); },
		function(_) { assert.equal(process._counter, 2); _(); }, // We expect only two invocations. The rest should be cached.
], done)();
```

should avoid hashing _hashed patches, and should used the undelying hash instead.

```js
var newHash = new HashDB(new DummyKVS());
var patch = {type: 'add', amount: 2};
util.seq([
		function(_) { hash.hash(patch, _.to('patchHash')); },
		function(_) { app.trans(h0, patch, _.to('h1')); },
		function(_) { this.newApp = new HashedApp(new App(newHash), newHash, kvs); _(); },
		function(_) { this.newApp.trans(h0, {type: '_hashed', hash: this.patchHash}, _.to('alt_h1')); },
		function(_) { assert.equal(this.h1.$hash$, this.alt_h1.$hash$); _(); },
], done)();
```

<a name="hashedapp-query"></a>
## query
should return the result of applying a patch.

```js
util.seq([
		function(_) { app.query(h0, {type: 'get'}, _.to('result')); },
		function(_) { assert.equal(this.result, 0); _(); },
], done)();
```

should fail when given a patch that modifies the state.

```js
app.query(h0, {type: 'add', amount: 2}, function(err) {
		if(!err) {
		    done(new Error('No error emitted'));
		} else if(err.message != 'Attempted query changed state') {
		    done(new Error('Wrong error received: ' + err.message));
		} else {
		    done();
		}
});
```

<a name="hashedapp-branchquery"></a>
## branchQuery
should perform a query on the tip of the given branch.

```js
util.seq([
		function(_) { app.branchQuery(branch, {type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 0); _(); },
], done)();
```

<a name="hashedapp-branchtrans"></a>
## branchTrans
should perform a transition, updating the tip of the branch.

```js
util.seq([
		function(_) { app.branchTrans(branch, {type: 'add', amount: 2}, 3, _); },
		function(_) { app.branchQuery(branch, {type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 2); _(); },
], done)();
```

<a name="inverse-patch"></a>
# inverse patch
<a name="inverse-patch-patch"></a>
## patch
should unapply the underlying patch.

```js
util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'inv', patch: {_type: 'add', amount: 2}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, -2); _(); },
], done)();
```

<a name="inverse-patch-unpatch"></a>
## unpatch
should apply the undelying patch.

```js
util.seq([
		function(_) { evalEnv.init('counter', {}, _.to('s0')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'inv', patch: {_type: 'add', amount: 2}}, true, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 2); _(); },
], done)();
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

<a name="vcobj"></a>
# VCObj
<a name="vcobj-createobjectcls-s0-cberr-h0"></a>
## createObject(cls, s0, cb(err, h0))
should create an object state hash for the given class and initial state.

```js
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
var cls = { foo: function() { console.log("bar"); }, 
			bar: function() { console.log("baz"); } };
util.seq([
		function(_) { obj.createObject(cls, {val:0}, _.to('h0')); },
		function(_) { hashDB.unhash(this.h0, _.to('s0')); },
		function(_) { assert.equal(this.s0.val, 0);
			      hashDB.unhash(this.s0._class, _.to('cls'));},
		function(_) { assert.equal(this.cls.foo, 'function () { console.log("bar"); }'); _(); },
], done)();
```

<a name="vcobj-applyh1-patch-cberr-h2-res-effect-conflict"></a>
## apply(h1, patch, cb(err, h2, res, effect, conflict))
should apply a patch to the given state, activating a class method.

```js
var rand = Math.random();
var cls = {
		foo: function(p, ctx) { process._beenThere = p.rand; ctx.ret(); }
};
var obj = new VCObj(new HashDB(new DummyKVS()), new DummyKVS());
util.seq([
		function(_) { obj.createObject(cls, {}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo', rand: rand}, _); },
		function(_) { assert.equal(process._beenThere, rand); _(); },
], done)();
```

should emit the new state hash, and the result emitted by the invoked method.

```js
var cls = {
		foo: function(p, ctx) { ctx.ret('result'); }
};
var obj = new VCObj(new HashDB(new DummyKVS()), new DummyKVS());
util.seq([
		function(_) { obj.createObject(cls, {}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1', 'res', 'effect', 'conflict')); },
		function(_) { assert.deepEqual(this.h1, this.h0);
			      assert.equal(this.res, 'result'); _();},
], done)();
```

should pass the invoked method the state as its this parameter.

```js
var cls = {
		foo: function(p, ctx) { ctx.ret(this.baz); }
};
var obj = new VCObj(new HashDB(new DummyKVS()), new DummyKVS());
util.seq([
		function(_) { obj.createObject(cls, {baz: 'bat'}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1', 'res')); },
		function(_) { assert.deepEqual(this.h1, this.h0);
			      assert.equal(this.res, 'bat'); _();},
], done)();
```

should emit the new state based on the content of "this" when the method returns.

```js
var cls = {
		foo: function(p, ctx) { this.bar = 'baz'; ctx.ret(); }
};
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
util.seq([
		function(_) { obj.createObject(cls, {}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1')); },
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.equal(this.s1.bar, 'baz'); _();},
], done)();
```

should allow objects to further call other objects by sending them patches.

```js
var cls1 = {
		foo: function(p, ctx) {
		    var state = this;
		    util.seq([
			function(_) { ctx.query(state.child, {type: 'bar'}, _.to('res')); },
			function(_) { ctx.ret(this.res); },
		    ], ctx.done)();
		}
};
var cls2 = {
		bar: function(p, ctx) {
		    ctx.ret(this.val + 1);
		}
}
var obj = new VCObj(new HashDB(new DummyKVS()), new DummyKVS());
util.seq([
		function(_) { obj.createObject(cls2, {val:2}, _.to('child')); },
		function(_) { obj.createObject(cls1, {child: this.child}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1', 'res')); },
		function(_) { assert.equal(this.res, 3); _(); },
], done)();
```

should report conflict if the context conflict() method was called.

```js
var cls = {
		foo: function(p, ctx) { ctx.conflict(); ctx.ret(); }
};
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
util.seq([
		function(_) { obj.createObject(cls, {}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1', 'res', 'effect', 'conflict')); },
		function(_) { assert(this.conflict, 'The conflict flag should be true'); _();},
], done)();
```

should propagate conflicts reported in child objects.

```js
var cls1 = {
		foo: function(p, ctx) {
		    var state = this;
		    util.seq([
			function(_) { ctx.trans(state.child, {type: 'bar', val: 2}, _.to('child')); },
			function(_) { state.child = this.child;
				      ctx.ret(); },
		    ], ctx.done)();
		}
};
var cls2 = {
		bar: function(p, ctx) {
		    var state = this;
		    state.val = p.val;
		    ctx.conflict(); // The child conflicts
		    ctx.ret();
		}
}
var obj = new VCObj(new HashDB(new DummyKVS()), new DummyKVS());
util.seq([
		function(_) { obj.createObject(cls2, {}, _.to('child')); },
		function(_) { obj.createObject(cls1, {child: this.child}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1', 'res', 'effect', 'conflict')); },
		function(_) { assert(this.conflict, 'the conflict flag should be true'); _(); },
], done)();
```

should accept patches that have a "code" field instead of "type".

```js
var code = function(patch, ctx) {
		this.val += patch.amount;
		ctx.ret();
}
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
util.seq([
		function(_) { hashDB.hash(code.toString(), _.to('code')); },
		function(_) { obj.createObject({}, {val:0}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {code: this.code, amount: 3}, _.to('h1')); },
		function(_) { hashDB.unhash(this.h1, _.to('s1')); },
		function(_) { assert.equal(this.s1.val, 3); _(); },
], done)();
```

<a name="vcobj-invertpatch-cberr-invpatch"></a>
## invert(patch, cb(err, invPatch))
should invert any patch that has an inv field specifying its inversion logic.

```js
var inv = function(patch, cb) {
		patch.amount = -patch.amount;
		cb(undefined, patch);
}
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
util.seq([
		function(_) { hashDB.hash(inv.toString(), _.to('invHash')); },
		function(_) { obj.invert({type: 'add', amount: 2, inv: this.invHash}, _.to('inv')); },
		function(_) { assert.deepEqual(this.inv, {type: 'add', amount: -2, inv: this.invHash}); _(); },
], done)();
```

should return the patch unchanged in case an inv field does not exist.

```js
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
util.seq([
		function(_) { obj.invert({type: 'add', amount: 2}, _.to('inv')); },
		function(_) { assert.deepEqual(this.inv, {type: 'add', amount: 2}); _(); },
], done)();
```

<a name="vcobj-createchainpatchpatches-cberr-patch"></a>
## createChainPatch(patches, cb(err, patch))
should create a patch that applies all given patches one by one.

```js
function createCounter(obj, hashDB, cb) {
		var cls = {
		    add: function(patch, ctx) {
			this.val += patch.amount;
			ctx.ret();
		    },
		    get: function(patch, ctx) {
			ctx.ret(this.val);
		    },
		};
		var invAdd = function(patch, cb) {
		    patch.amount = -patch.amount;
		    cb(undefined, patch);
		};
		util.seq([
		    function(_) { obj.createObject(cls, {val:0}, _.to('h0')); },
		    function(_) { hashDB.hash(invAdd.toString(), _.to('invAdd')); },
		    function(_) { cb(undefined, this.h0, this.invAdd); },
		], cb)();
}
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
util.seq([
		function(_) { createCounter(obj, hashDB, _.to('h0', 'invAdd')); },
		function(_) { obj.createChainPatch([{type: 'add', amount: 2, inv: this.invAdd}, 
						    {type: 'add', amount: 3, inv: this.invAdd}], _.to('p')); },
		function(_) { obj.apply(this.h0, this.p, _.to('h1')); },
		function(_) { obj.apply(this.h1, {type: 'get'}, _.to('h2', 'res')); },
		function(_) { assert.equal(this.res, 5); _(); },
], done)();
```

should support correct inversion of the resulting patch.

```js
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
util.seq([
		function(_) { createCounter(obj, hashDB, _.to('h0', 'invAdd')); },
		function(_) { obj.createChainPatch([{type: 'add', amount: 2, inv: this.invAdd}, 
						    {type: 'add', amount: 3, inv: this.invAdd}], _.to('p')); },
		function(_) { obj.invert(this.p, _.to('invP')); },
		function(_) { obj.trans(this.h0, this.invP, _.to('h1')); },
		function(_) { obj.query(this.h1, {type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, -5); _(); },
], done)();
```

<a name="vcobj-transh1-patch-cbh2-res-effect-conflict"></a>
## trans(h1, patch, cb(h2, res, effect, conflict))
should apply the given patch on h1 to receive h2.

```js
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
util.seq([
		function(_) { createCounter(obj, hashDB, _.to('h0', 'invAdd')); },
		function(_) { obj.trans(this.h0, {type: 'add', inv: this.invAdd, amount: 2}, _.to('h1')); },
		function(_) { obj.apply(this.h1, {type: 'get'}, _.to('h2', 'res')); },
		function(_) { assert.equal(this.res, 2); _(); },
], done)();
```

should cache previous state/patch pairs and avoid re-calculation.

```js
function createCounter(obj, hashDB, cb) {
		var cls = {
		    add: function(patch, ctx) {
			process._counterTest++; // Count the applications as a side-effect
			this.val += patch.amount;
			ctx.ret();
		    },
		    get: function(patch, ctx) {
			ctx.ret(this.val);
		    },
		};
		var invAdd = function(patch, cb) {
		    patch.amount = -patch.amount;
		    cb(undefined, patch);
		};
		util.seq([
		    function(_) { obj.createObject(cls, {val:0}, _.to('h0')); },
		    function(_) { hashDB.hash(invAdd.toString(), _.to('invAdd')); },
		    function(_) { cb(undefined, this.h0, this.invAdd); },
		], cb)();
}
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
process._counterTest = 0;
util.seq([
		function(_) { createCounter(obj, hashDB, _.to('h0', 'invAdd')); },
		function(_) { obj.trans(this.h0, {type: 'add', inv: this.invAdd, amount: 2}, _.to('h1')); },
		function(_) { obj.trans(this.h1, {type: 'add', inv: this.invAdd, amount: -2}, _.to('h2')); },
		function(_) { obj.trans(this.h2, {type: 'add', inv: this.invAdd, amount: 2}, _.to('h3')); },
		function(_) { obj.trans(this.h3, {type: 'add', inv: this.invAdd, amount: -2}, _.to('h4')); },
		function(_) { obj.trans(this.h4, {type: 'add', inv: this.invAdd, amount: 2}, _.to('h5')); },
		function(_) { obj.trans(this.h5, {type: 'add', inv: this.invAdd, amount: -2}, _.to('h6')); },
		function(_) { obj.trans(this.h6, {type: 'add', inv: this.invAdd, amount: 2}, _.to('h7')); },
		function(_) { obj.trans(this.h7, {type: 'add', inv: this.invAdd, amount: -2}, _); },
		function(_) { assert.equal(process._counterTest, 2); _(); },
], done)();
```

<a name="vcobj-queryh1-patch-cberr-ret"></a>
## query(h1, patch, cb(err, ret))
should return the result of applying the patch on an object with the given state.

```js
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
util.seq([
		function(_) { createCounter(obj, hashDB, _.to('h0', 'invAdd')); },
		function(_) { obj.trans(this.h0, {type: 'add', inv: this.invAdd, amount: 2}, _.to('h1')); },
		function(_) { obj.query(this.h1, {type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 2); _(); },
], done)();
```

should fail if the patch modifies the state.

```js
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB, new DummyKVS());
util.seq([
		function(_) { createCounter(obj, hashDB, _.to('h0', 'invAdd')); },
		function(_) { obj.query(this.h0, {type: 'add', inv: this.invAdd, amount: 2}, _); },
], function(err) {
		if(!err) {
		    done(new Error('Error not emitted'));
		} else if(err.message == 'Query patches should not change object state') {
		    done();
		} else {
		    done(err);
		}
})();
```

