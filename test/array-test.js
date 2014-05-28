assert = require('assert');
ObjectDisp = require('../objectDisp.js');
DummyObjectStore = require('../dummyObjectStore.js');
CheckerObjectStore = require('./checkerObjectStore.js');

var disp = new ObjectDisp({
    Counter: require('../counter.js'),
    Array: require('../array.js'),
    ':inv': require('../inv.js'),
    ':digest': require('../defaultDigest.js'),
});
var ostore = new CheckerObjectStore(new DummyObjectStore(disp));

describe('Array', function(){
    describe('init', function(){
	it('should create an array containing objects in their initial version', function(){
	    var ctx = {};
	    var v = ostore.init(ctx, 'Array', {size: 10, className: 'Counter'});
	    var counter = ostore.trans(ctx, v, {_type: 'get', index: 2})[1];
	    var zero = ostore.trans(ctx, counter, {_type: 'get'})[1];
	    assert.equal(zero, 0);
	});
    });
    describe('apply', function(){
	it('should relay a patch to an array entry corresponding to the given index', function(){
	    var ctx = {};
	    var v = ostore.init(ctx, 'Array', {size: 6, className: 'Counter'});
	    v = ostore.trans(ctx, v, {_type: 'apply', index: 3, patch: {_type: 'add', amount: 4}})[0];
	    var counter = ostore.trans(ctx, v, {_type: 'get', index: 3})[1];
	    var four = ostore.trans(ctx, counter, {_type: 'get'})[1];
	    assert.equal(four, 4);
	});
	it('should return the underlying patch\'s return value', function(){
	    var ctx = {};
	    var v = ostore.init(ctx, 'Array', {size: 10, className: 'Counter'});
	    v = ostore.trans(ctx, v, {_type: 'apply', index: 3, patch: {_type: 'add', amount: 5}})[0];
	    var five = ostore.trans(ctx, v, {_type: 'apply', index: 3, patch: {_type: 'get'}})[1];
	    assert.ifError(ctx.error);
	    assert.equal(five, 5);
	});
    });
});
