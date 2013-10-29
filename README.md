# TOC
   - [application](#application)
     - [initialState](#application-initialstate)
     - [apply](#application-apply)
     - [inv](#application-inv)
   - [counter](#counter)
     - [get](#counter-get)
     - [add](#counter-add)
   - [hash](#hash)
   - [HashedApp](#hashedapp)
     - [initialState](#hashedapp-initialstate)
     - [apply](#hashedapp-apply)
     - [trans](#hashedapp-trans)
     - [query](#hashedapp-query)
<a name=""></a>
 
<a name="application"></a>
# application
<a name="application-initialstate"></a>
## initialState
should properly create an initial state.

```js
var app = new App(hash);
util.seq([
		function(_) { app.initialState(appHash, _.to('s0')); },
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
		function(_) { app.inv(appHash, {type: 'add', amount: 2}, _.to('inv')); },
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

<a name="hash"></a>
# hash
should give any two different JSONable objects a different hash code.

```js
var hash = new Hash(new DummyKVS());
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
var hash = new Hash(new DummyKVS());
var obj = {foo: 'bar', count: [1, 2, 3]};
util.seq([
    function(_) { hash.hash(obj, _.to('h')); },
    function(_) { hash.unhash(this.h, _.to('obj')); },
    function(_) { assert.deepEqual(this.obj, obj); _(); },
], done)();
```

should store its own copy of the object.

```js
var hash = new Hash(new DummyKVS());
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

should handle _inv patches.

```js
util.seq([
		function(_) { app.apply(h0, {type: '_inv', patch: {type: 'add', amount: 2}}, _.to('h1', 'r1', 'sf1')); },
		function(_) { assert(this.sf1, 'inverted operation should be safe'); _(); },
		function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
		function(_) { assert.equal(this.r2, -2); _(); },
], done)();
```

should handle _comp patches.

```js
util.seq([
		function(_) { app.apply(h0, {type: '_comp', patches: [{type: 'add', amount: 1}, 
								      {type: 'add', amount: 2}, 
								      {type: 'add', amount: 3}]}, _.to('h1', 'r1', 'sf1')); },
		function(_) { assert(this.sf1, 'composite operation should be safe'); _(); },
		function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
		function(_) { assert.equal(this.r2, 6); _(); },
], done)();
```

should handle _hashed patches.

```js
util.seq([
		function(_) { hash.hash({type: 'add', amount: 3}, _.to('ph')); },
		function(_) { app.apply(h0, {type: '_hashed', hash: this.ph}, _.to('h1', 'r1', 'sf1')); },
		function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
		function(_) { assert.equal(this.r2, 3); _(); },
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
		function(_) { app.trans(h0, {type: 'add', amount: 3}, _.to('h1', 'sf1')); },
		function(_) { assert(this.sf1, 'add operation should be safe'); _(); },
		function(_) { app.apply(this.h1, {type: 'get'}, _.to('h1', 'r1')); },
		function(_) { assert.equal(this.r1, 3); _(); },
		function(_) { app.trans(this.h1, {type: 'add', amount: -3}, _.to('h2', 'sf2')); },
		function(_) { assert.equal(this.h2.$hash$, h0.$hash$); _(); },
], done)();
```

should cache previous calls and only invoke the actual method if the combination of input state and patch have not yet been encountered.

```js
process._counter = 0; // The counter's 'add' method increments this counter as a side effect.
util.seq([
		function(_) { app.trans(h0, {type: 'add', amount: 3}, _.to('h1', 'sf1')); },
		function(_) { app.trans(this.h1, {type: 'add', amount: -3}, _.to('h2', 'sf2')); },
		function(_) { app.trans(this.h2, {type: 'add', amount: 3}, _.to('h3', 'sf3')); },
		function(_) { app.trans(this.h3, {type: 'add', amount: -3}, _.to('h4', 'sf4')); },
		function(_) { app.trans(this.h4, {type: 'add', amount: 3}, _.to('h5', 'sf5')); },
		function(_) { app.trans(this.h5, {type: 'add', amount: -3}, _.to('h6', 'sf6')); },
		function(_) { assert(this.sf6, 'all operations should be safe'); _(); },
		function(_) { assert.equal(process._counter, 2); _(); }, // We expect only two invocations. The rest should be cached.
], done)();
```

should avoid hashing _hashed patches, and should used the undelying hash instead.

```js
var newHash = new Hash(new DummyKVS());
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

