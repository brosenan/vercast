var assert = require('assert');
var ObjectDisp = require('../objectDisp.js');
var disp = new ObjectDisp({
    'counter': require('../counter.js'),
});

describe('counter', function(){
    describe('init', function(){
	it('should create a counter with value = 0', function(done){
	    var initial = disp.init({}, 'counter', {});
	    assert.equal(initial.value, 0);
	    done();
	});
    });
    describe('add', function(){
	it('should add the given ammount to the counter value', function(done){
	    var c = disp.init({}, 'counter', {});
	    c = disp.apply({}, c, {_type: 'add', amount: 2})[0];
	    assert.equal(c.value, 2);
	    done();
	});
	it('should subtract the given amount when unapplied', function(done){
	    var c = disp.init({}, 'counter', {});
	    c = disp.apply({}, c, {_type: 'add', amount: 2}, -1)[0];
	    assert.equal(c.value, -2);
	    done();
	});
    });
    describe('get', function(){
	it('should return the counter value', function(done){
	    var c = disp.init({}, 'counter', {});
	    c = disp.apply({}, c, {_type: 'add', amount: 2})[0];
	    res = disp.apply({}, c, {_type: 'get'})[1];
	    assert.equal(res, 2);
	    done();
	});

    });

});
