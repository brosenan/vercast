var assert = require('assert');
var ObjectDisp = require('../objectDisp.js');
var disp = new ObjectDisp({
    'counter': require('../counter.js'),
    ':inv': require('../inv.js'),
});
var scenario = require('./scenario.js');

describe('counter', function(){
    describe('init', function(){
	it('should create a counter with value = 0', scenario(disp, [
	    {_type: 'counter'},
	    {_type: 'get'},
	    function(value) {
		assert.equal(value, 0);
	    }]));
    });
    describe('add', function(){
	it('should add the given ammount to the counter value', scenario(disp, [
	    {_type: 'counter'},
	    {_type: 'add', amount: 2},
	    {_type: 'get'},
	    function(value) {
		assert.equal(value, 2);
	    }]));
	it('should subtract the given amount when unapplied', scenario(disp, [
	    {_type: 'counter'},
	    {_type: 'inv', patch: {_type: 'add', amount: 2}},
	    {_type: 'get'},
	    function(value) {
		assert.equal(value, -2);
	    }]));
    });
    describe('get', function(){
	it('should return the counter value', scenario(disp, [
	    {_type: 'counter'},
	    {_type: 'inv', patch: {_type: 'add', amount: 2}},
	    {_type: 'get'},
	    function(value) {
		assert.equal(value, -2);
	    }]));
    });

});
