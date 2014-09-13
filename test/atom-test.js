var assert = require('assert');
var ObjectDisp = require('../objectDisp.js');
var disp = new ObjectDisp({
    'counter': require('../counter.js'),
    ':inv': require('../inv.js'),
    'atom': require('../atom.js'),
});
var scenario = require('./scenario.js');

describe('Atom', function(){
    describe('get', function(){
	it('should return the content of an atom', scenario(disp, [
	    {_type: 'atom', value: 'foo'},
	    {_type: 'get'},
	    function(v) { assert.equal(v, 'foo'); },
	]))
    });
    describe('change', function(){
	it('should replace one value with another', scenario(disp, [
	    {_type: 'atom', value: 'foo'},
	    {_type: 'change', from: 'foo', to: 'bar'},
	    {_type: 'get'},
	    function(v) { assert.equal(v, 'bar'); },
	]));
	it('should raise a conflict if the precondition is not met', scenario(disp, [
	    {_type: 'atom', value: 'foo'},
	    {_type: 'change', from: 'bar', to: 'baz'},
	    {conflict: true},
	]));
    });
});
