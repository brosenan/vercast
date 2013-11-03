var HashDB = require('../hashDB.js');
var util = require('../util.js');
var assert = require('assert');
var DummyKVS = require('../keyvalue.js');

describe('hash', function(){
    it('should give any two different JSONable objects a different hash code', function(done){
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
    });
    it('should reconstruct an object from the hash that is identical to the origianl object', function(done){
	var hash = new HashDB(new DummyKVS());
	var obj = {foo: 'bar', count: [1, 2, 3]};
	util.seq([
	    function(_) { hash.hash(obj, _.to('h')); },
	    function(_) { hash.unhash(this.h, _.to('obj')); },
	    function(_) { assert.deepEqual(this.obj, obj); _(); },
	], done)();
    });
    it('should store its own copy of the object', function(done){
	var hash = new HashDB(new DummyKVS());
	var obj = {foo: 'bar', count: [1, 2, 3]};
	util.seq([
	    function(_) { hash.hash(obj, _.to('h')); },
	    function(_) { obj.foo = 'baz'; _(); },
	    function(_) { hash.unhash(this.h, _.to('obj')); },
	    function(_) { assert.equal(this.obj.foo, 'bar'); _(); },
	], done)();
    });


});
