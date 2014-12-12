"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

describe('counter', function(){
    it('should add the given amount to the counter and return the value', asyncgen.async(function*(){
	var otb = new vercast.ObjectTestBed({counter: vercast.examples.counter}, 'counter', {});
	var r = yield* otb.trans({_type: 'add', amount: 3});
	assert.equal(r, 3);
	var r = yield* otb.trans({_type: 'add', amount: 2});
	assert.equal(r, 5);
    }));
    describe('get', function(){
	it('should return the counter\'s value', asyncgen.async(function*(){
	    var otb = new vercast.ObjectTestBed({counter: vercast.examples.counter}, 'counter', {});
	    yield* otb.trans({_type: 'add', amount: 3});
	    assert.equal(yield* otb.trans({_type: 'get'}), 3);
	}));

    });

    describe('put{value}', function(){
	it('should reset the counter to the given value', asyncgen.async(function*(){
	    var otb = new vercast.ObjectTestBed({counter: vercast.examples.counter}, 'counter', {});
	    yield* otb.trans({_type: 'add', amount: 20});
	    yield* otb.trans({_type: 'put', value: 3});
	    assert.equal(yield* otb.trans({_type: 'get'}), 3);
	}));
    });
});
