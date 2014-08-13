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
    });
});
