var hash = require('../hash.js');
var util = require('../util.js');
var assert = require('assert');

describe('hash', function(){
    it('should give any two different JSONable objects a different hash code', function(done){
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
    });

});
