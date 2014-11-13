"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

describe('ObjectTestBed', function(){
    describe('.trans(p)', function(){
	it('should apply a patch, returning the result', asyncgen.async(function*(){
	    var dispMap = {
		counter: {
		    init: function*() {this.value = 0;},
		    add: function*(ctx, p, u) {
			this.value += (u?-1:1) * p.amount;
			return this.value;
		    },
		},
	    };
	    var otb = new vercast.ObjectTestBed(dispMap, 'counter', {});
	    var r = yield* otb.trans({_type: 'add', amount: 2});
	    assert.equal(r, 2);
	    r = yield* otb.trans({_type: 'add', amount: 3});
	    assert.equal(r, 5);
	}));
	it('should fail for non-reversible transformations', asyncgen.async(function*(){
	    var dispMap = {
		badCounter: {
		    init: function*() {this.value = 0;},
		    add: function*(ctx, p, u) {
			this.value += p.amount; // ignoring u
			return this.value;
		    },
		},
	    };
	    var otb = new vercast.ObjectTestBed(dispMap, 'badCounter', {});
	    try {
		yield* otb.trans({_type: 'add', amount: 2});
		assert(false, 'error is expected');
	    } catch(e) {
		assert.equal(e.message, 'Transformation "add" for type "badCounter" is not reversible');
	    }
	}));
	it('should fail for independent transformations that do not commute', asyncgen.async(function*(){
	    var dispMap = {
		badCounter: {
		    init: function*() {this.value = 0;},
		    add: function*(ctx, p, u) {
			this.value += (u?-1:1) * p.amount;
			return this.value;
		    },
		    mult: function*(ctx, p, u) {
			if(u) {
			    this.value /= p.amount;
			} else {
			    this.value *= p.amount;
			}
			return this.value;
		    },
		},
	    };
	    var otb = new vercast.ObjectTestBed(dispMap, 'badCounter', {});
	    yield* otb.trans({_type: 'add', amount: 2});
	    try {
		yield* otb.trans({_type: 'mult', amount: 3});
		assert(false, 'error is expected');
	    } catch(e) {
		assert.equal(e.message, 'Transformations "add" and "mult" for type "badCounter" are independent but do not commute');
	    }
	}));

    });
});
