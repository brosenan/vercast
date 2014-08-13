var assert = require('assert');
var ObjectDisp = require('../objectDisp.js');
var disp = new ObjectDisp({
    'counter': require('../counter.js'),
    ':inv': require('../inv.js'),
    'directory': require('../directory.js'),
});
var scenario = require('./scenario.js');

describe('Directory', function(){
    describe('put', function(){
	it('should construct a new object if the _path if of size 1 and the entry does not exist', scenario(disp, [
	    {_type: 'directory'},
	    {_type: 'put', _path: ['child1'], content: {_type: 'counter'}},
	]));
	it('should report a conflict if the child already exist', scenario(disp, [
	    {_type: 'directory'},
	    {_type: 'put', _path: ['child1'], content: {_type: 'counter'}},
	    {_type: 'put', _path: ['child1'], content: {_type: 'counter'}},
	    {conflict: 1},
	]));
	it('should create sub-directories if they do not exist', scenario(disp, [
	    {_type: 'directory'},
	    {_type: 'put', _path: ['foo', 'bar'], content: {_type: 'counter'}},
	    {_type: 'put', _path: ['foo', 'baz'], content: {_type: 'counter'}},
	    {_type: 'add', _path: ['foo', 'bar'], amount: 3},
	    {_type: 'add', _path: ['foo', 'baz'], amount: 4},
	    {_type: 'get', _path: ['foo', 'bar']},
	    function(v) { assert.equal(v, 3); },
	    {_type: 'get', _path: ['foo', 'baz']},
	    function(v) { assert.equal(v, 4); },
	]));
    });
    describe('_default', function(){
	it('should propagate patches to the relevant child', scenario(disp, [
	    {_type: 'directory'},
	    {_type: 'put', _path: ['child1'], content: {_type: 'counter'}},
	    {_type: 'put', _path: ['child2'], content: {_type: 'counter'}},
	    {_type: 'add', _path: ['child1'], amount: 3},
	    {_type: 'get', _path: ['child1']},
	    function(v) { assert.equal(v, 3); },
	    {_type: 'get', _path: ['child2']},
	    function(v) { assert.equal(v, 0); },
	]));
	it('should conflict when the child does not exist', scenario(disp, [
	    {_type: 'directory'},
	    {_type: 'get', _path: ['child1']},
	    {conflict: 1},
	]));
    });
    describe('count', function(){
	it('should return a count of the number of immediate children of a directory', scenario(disp, [
	    {_type: 'directory'},
	    {_type: 'put', _path: ['child1'], content: {_type: 'counter'}},
	    {_type: 'put', _path: ['child2'], content: {_type: 'counter'}},
	    {_type: 'count', _path: []},
	    function(c) { assert.equal(c, 2); },
	]));
	it('should be propagated to a child if the path so indicates', scenario(disp, [
	    {_type: 'directory'},
	    {_type: 'put', _path: ['child1'], content: {_type: 'counter'}},
	    {_type: 'count', _path: ['child1']},
	    {error: 'Patch method count is not defined in class counter'},
	]));
    });
});
