# TOC
   - [hash](#hash)
<a name=""></a>
 
<a name="hash"></a>
# hash
should give any two different JSONable objects a different hash code.

```js
var obj1 = {foo: 'bar', count: [1, 2, 3]};
var obj2 = {foo: 'bar', count: [1, 2, 4]};
util.seq([
    function(_) { hash.hash(obj1, _.to('h1')); },
    function(_) { hash.hash(obj2, _.to('h2')); },
    function(_) {
	assert.equal(typeof this.h1, 'string');
	assert.equal(typeof this.h2, 'string');
	assert(this.h1 != this.h2, 'hash objects should differ');
	_();
    },
], done)();
```

