var Hash = require('../hash.js');
var util = require('../util.js');
var assert = require('assert');

describe('hash', function(){
    it('should give any two different JSONable objects a different hash code', function(done){
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
    });
    it('should reconstruct an object from the hash that is identical to the origianl object', function(done){
	var hash = new Hash();
	var obj = {foo: 'bar', count: [1, 2, 3]};
	util.seq([
	    function(_) { hash.hash(obj, _.to('h')); },
	    function(_) { hash.unhash(this.h, _.to('obj')); },
	    function(_) { assert.deepEqual(this.obj, obj); _(); },
	], done)();
    });

});
