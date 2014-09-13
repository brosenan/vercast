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
});
