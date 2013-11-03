# TOC
   - [application](#application)
     - [initialState](#application-initialstate)
     - [apply](#application-apply)
     - [inv](#application-inv)
   - [counter](#counter)
     - [get](#counter-get)
     - [add](#counter-add)
   - [DummyBranch](#dummybranch)
     - [as Branch](#dummybranch-as-branch)
       - [checkedUpdate](#dummybranch-as-branch-checkedupdate)
   - [DummyVersionGraph](#dummyversiongraph)
     - [as VersionGraph](#dummyversiongraph-as-versiongraph)
       - [addEdge](#dummyversiongraph-as-versiongraph-addedge)
       - [findCommonAncestor](#dummyversiongraph-as-versiongraph-findcommonancestor)
   - [hash](#hash)
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
   - [VCObj](#vcobj)
     - [createObject(cls, s0, cb(err, h0))](#vcobj-createobjectcls-s0-cberr-h0)
     - [apply(h1, patch, cb(err, h2, res, effect, conflict))](#vcobj-applyh1-patch-cberr-h2-res-effect-conflict)
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

<a name="counter"></a>
# counter
<a name="counter-get"></a>
## get
should initially return 0.

```js
var counter = new Counter();
var s0 = counter.getInitialState();
util.seq([
		function(_) { counter.apply(s0, {type: 'get'}, _.to('s1', 'val', 'sf')); },
		function(_) {
		    assert.deepEqual(this.s1, s0, 'get should not change the state');
		    assert.equal(this.val, 0);
		    assert.equal(this.sf, true);
		    _();
		},
], done)();
```

<a name="counter-add"></a>
## add
should increase the counter value by the given amount.

```js
var counter = new Counter();
var s0 = counter.getInitialState();
util.seq([
		function(_) { counter.apply(s0, {type: 'add', amount: 2}, _.to('s1')); },
		function(_) { counter.apply(this.s1, {type: 'get'}, _.to('s2', 'val')); },
		function(_) {
		    assert.equal(this.val, 2);
		    _();
		},
], done)();
```

should be reversible.

```js
var counter = new Counter();
var s0 = counter.getInitialState();
var s0Copy = JSON.parse(JSON.stringify(s0));
var patch = {type: 'add', amount: 2};
util.seq([
		function(_) { counter.apply(s0, patch, _.to('s1')); },
		function(_) { counter.apply(this.s1, counter.inv(patch), _.to('s0')); },
		function(_) {
		    assert.deepEqual(this.s0, s0Copy);
		    _();
		},
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

<a name="hash"></a>
# hash
should give any two different JSONable objects a different hash code.

```js
var hash = new HashDB(new DummyKVS());
var obj1 = {foo: 'bar', count: [1, 2, 3]};
var obj2 = {foo: 'bar', count: [1, 2, 4]};
util.seq([
    function(_) { hash.hash(obj1, _.to('h1')); },
    function(_) { hash.hash(obj2, _.to('h2')); },
    function(_) {
	assert.equal(typeof this.h1.$hash$, 'string');
	assert.equal(typeof this.h2.$hash$, 'string');
	assert(this.h1.$hash$ != this.h2.$hash$, 'hash objects should differ');
	_();
    },
], done)();
```

should reconstruct an object from the hash that is identical to the origianl object.

```js
var hash = new HashDB(new DummyKVS());
var obj = {foo: 'bar', count: [1, 2, 3]};
util.seq([
    function(_) { hash.hash(obj, _.to('h')); },
    function(_) { hash.unhash(this.h, _.to('obj')); },
    function(_) { assert.deepEqual(this.obj, obj); _(); },
], done)();
```

should store its own copy of the object.

```js
var hash = new HashDB(new DummyKVS());
var obj = {foo: 'bar', count: [1, 2, 3]};
util.seq([
    function(_) { hash.hash(obj, _.to('h')); },
    function(_) { obj.foo = 'baz'; _(); },
    function(_) { hash.unhash(this.h, _.to('obj')); },
    function(_) { assert.equal(this.obj.foo, 'bar'); _(); },
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

<a name="vcobj"></a>
# VCObj
<a name="vcobj-createobjectcls-s0-cberr-h0"></a>
## createObject(cls, s0, cb(err, h0))
should create an object state hash for the given class and initial state.

```js
var hashDB = new HashDB(new DummyKVS());
var obj = new VCObj(hashDB);
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
var obj = new VCObj(new HashDB(new DummyKVS()));
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
var obj = new VCObj(new HashDB(new DummyKVS()));
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
var obj = new VCObj(new HashDB(new DummyKVS()));
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
var obj = new VCObj(hashDB);
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
			function(_) { ctx.apply(state.child, {type: 'bar', val: 2}, _.to('child', 'res')); },
			function(_) { ctx.ret(this.res); },
		    ], ctx.done)();
		}
};
var cls2 = {
		bar: function(p, ctx) {
		    var state = this;
		    state.val = p.val;
		    ctx.ret(p.val + 1);
		}
}
var obj = new VCObj(new HashDB(new DummyKVS()));
util.seq([
		function(_) { obj.createObject(cls2, {}, _.to('child')); },
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
var obj = new VCObj(hashDB);
util.seq([
		function(_) { obj.createObject(cls, {}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo'}, _.to('h1', 'res', 'effect', 'conflict')); },
		function(_) { assert(this.conflict, 'The conflict flag should be true'); _();},
], done)();
```

