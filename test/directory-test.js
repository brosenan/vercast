var assert = require('assert');
var ObjectDisp = require('../objectDisp.js');
var disp = new ObjectDisp({
    'counter': require('../counter.js'),
    ':inv': require('../inv.js'),
    'directory': require('../directory.js'),
    'echo': { init: function() {}, 
	      _default: function(ctx, p, u) { return p; } },
    'query': { init: function() {}, 
	       relayPatch: function(ctx, p, u) { return ctx.query(p.self, p.patch.query); } },
});
var scenario = require('./scenario.js');

describe('Directory', function(){
    describe('_create', function(){
	it('should construct a new object if the _path if of size 1 and the entry does not exist', scenario(disp, [
	    {_type: 'directory'},
	    {_type: '_create', _path: ['child1'], content: {_type: 'counter'}},
	]));
	it('should report a conflict if the child already exist', scenario(disp, [
	    {_type: 'directory'},
	    {_type: '_create', _path: ['child1'], content: {_type: 'counter'}},
	    {_type: '_create', _path: ['child1'], content: {_type: 'counter'}},
	    {conflict: 1},
	]));
	it('should create sub-directories if they do not exist', scenario(disp, [
	    {_type: 'directory'},
	    {_type: '_create', _path: ['foo', 'bar'], content: {_type: 'counter'}},
	    {_type: '_create', _path: ['foo', 'baz'], content: {_type: 'counter'}},
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
	    {_type: '_create', _path: ['child1'], content: {_type: 'counter'}},
	    {_type: '_create', _path: ['child2'], content: {_type: 'counter'}},
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
	it('should propagate unhandled patches directed at the directory itself to the .@ child, if exists', scenario(disp, [
	    {_type: 'directory'},
	    {_type: '_create', _path: ['.@'], content: {_type: 'echo'}},
	    {_type: 'foo', _path: [], bar: 2},
	    function(v) { assert.equal(v._type, 'relayPatch');
			  assert.deepEqual(v.patch, {_type: 'foo', _path: [], bar: 2}); },
	]));
	it('should provide the directori\'s version ID', scenario(disp, [
	    {_type: 'directory'},
	    {_type: '_create', _path: ['foo', 'bar', '.@'], content: {_type: 'query'}},
	    {_type: '_create', _path: ['foo', 'bar', 'baz'], content: {_type: 'counter'}},
	    {_type: 'foo', _path: ['foo', 'bar'], query: {_type: 'get', _path: ['foo', 'bar', 'baz']}},
	    function(v) { assert.equal(v, 0); },
	]));

    });
    describe('count', function(){
	it('should return a count of the number of immediate children of a directory', scenario(disp, [
	    {_type: 'directory'},
	    {_type: '_create', _path: ['child1'], content: {_type: 'counter'}},
	    {_type: '_create', _path: ['child2'], content: {_type: 'counter'}},
	    {_type: 'count', _path: []},
	    function(c) { assert.equal(c, 2); },
	]));
	it('should be propagated to a child if the path so indicates', scenario(disp, [
	    {_type: 'directory'},
	    {_type: '_create', _path: ['child1'], content: {_type: 'counter'}},
	    {_type: 'count', _path: ['child1']},
	    {error: 'Patch method count is not defined in class counter'},
	]));
    });
    describe('_get_id', function(){
	var x;
	it('should return the version ID of the referenced object', scenario(disp, [
	    {_type: 'directory'},
	    {_type: '_create', _path: ['a', 'b1', 'c1'], content: {_type: 'counter'}},
	    {_type: '_create', _path: ['a', 'b1', 'c2'], content: {_type: 'counter'}},
	    {_type: '_create', _path: ['a', 'b2', 'c1'], content: {_type: 'counter'}},
	    {_type: '_create', _path: ['a', 'b2', 'c2'], content: {_type: 'counter'}},
	    {_type: 'add', _path: ['a', 'b1', 'c1'], amount: 1},
	    {_type: 'add', _path: ['a', 'b1', 'c2'], amount: 2},
	    {_type: 'add', _path: ['a', 'b2', 'c1'], amount: 2},
	    {_type: 'add', _path: ['a', 'b2', 'c2'], amount: 1},
	    {_type: '_get_id', _path: ['a', 'b1', 'c1']},
	    function(y) { x = y; },
	    {_type: '_get_id', _path: ['a', 'b2', 'c2']},
	    function(y) { assert.equal(y.$, x.$); },
	    {_type: '_get_id', _path: ['a', 'b1', 'c2']},
	    function(y) { x = y; },
	    {_type: '_get_id', _path: ['a', 'b2', 'c1']},
	    function(y) { assert.equal(y.$, x.$); },
	]));
    });
});
