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

    });

});
