var util = require('../util.js');
var assert = require('assert');
var Counter = require('../counter.js');

describe('counter', function(){
    describe('get', function(){
	it('should initially return 0', function(done){
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
	});
    });
    describe('add', function(){
	it('should increase the counter value by the given amount', function(done){
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
	});
	it('should be reversible', function(done){
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
	});

    });


});
