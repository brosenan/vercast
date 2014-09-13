var assert = require('assert');
var ObjectDisp = require('../objectDisp.js');
var disp = new ObjectDisp({
    'counter': require('../counter.js'),
    ':inv': require('../inv.js'),
    'directory': require('../directory.js'),
    'js': require('../js.js'),
    'atom': require('../atom.js'),
});
var scenario = require('./scenario.js');

describe('js', function(){
    it('should handle relayPatch patches by calling a Javascript function', scenario(disp, [
	{_type: 'directory'},
	{_type: '_create', _path: ['.@'], content: {_type: 'js', main: '.main.js'}},
	{_type: '_create', _path: ['.main.js'], content: {_type: 'atom', value: 'exports.foo = function() { return "bar"; };'}},
	{_type: 'foo', _path: []},
	function(res) { assert.equal(res, 'bar'); },
    ]));
    it('should report a syntax error if one occurs', scenario(disp, [
	{_type: 'directory'},
	{_type: '_create', _path: ['.@'], content: {_type: 'js', main: '.main.js'}},
	{_type: '_create', _path: ['.main.js'], content: {_type: 'atom', value: 'bla bla bla'}},
	{_type: 'foo', _path: []},
	{error: 'Unexpected identifier'},
    ]));
    it('should support loading modules from the same directory using the require() function', scenario(disp, [
	{_type: 'directory'},
	{_type: '_create', _path: ['.@'], content: {_type: 'js', main: '.main.js'}},
	{_type: '_create', _path: ['.other.js'], content: {_type: 'atom', value: 'exports.foo = function() { return "baz"; };'}},
	{_type: '_create', _path: ['.main.js'], content: {_type: 'atom', value: 'var other = require(".other.js"); exports.foo = function() { return other.foo(); };'}},
	{_type: 'foo', _path: []},
	function(res) { assert.equal(res, 'baz'); },
    ]));
    it('should provide the JS code a context to allow querying the directory', scenario(disp, [
	{_type: 'directory'},
	{_type: '_create', _path: ['.@'], content: {_type: 'js', main: '.main.js'}},
	{_type: '_create', _path: ['.main.js'], content: {_type: 'atom', value: 'exports.foo = function(ctx) { return ctx.query("foo", {_type: "get"}); };'}},
	{_type: '_create', _path: ['foo'], content: {_type: 'atom', value: 'bar'}},
	{_type: 'foo', _path: []},
	function(res) { assert.equal(res, 'bar'); },
    ]));
});
