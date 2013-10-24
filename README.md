# TOC
   - [application](#application)
   - [counter](#counter)
     - [get](#counter-get)
     - [add](#counter-add)
   - [hash](#hash)
<a name=""></a>
 
<a name="application"></a>
# application
should properly create an initial state.

```js
var app = new App(hash);
util.seq([
    function(_) { app.initialState(appHash, _.to('s0')); },
    function(_) { assert.equal(this.s0.val, 0); _(); },
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
var hash = new Hash();
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
var hash = new Hash();
var obj = {foo: 'bar', count: [1, 2, 3]};
util.seq([
    function(_) { hash.hash(obj, _.to('h')); },
    function(_) { hash.unhash(this.h, _.to('obj')); },
    function(_) { assert.deepEqual(this.obj, obj); _(); },
], done)();
```

should store its own copy of the object.

```js
var hash = new Hash();
var obj = {foo: 'bar', count: [1, 2, 3]};
util.seq([
    function(_) { hash.hash(obj, _.to('h')); },
    function(_) { obj.foo = 'baz'; _(); },
    function(_) { hash.unhash(this.h, _.to('obj')); },
    function(_) { assert.equal(this.obj.foo, 'bar'); _(); },
], done)();
```

