"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

describe('ObjectTestBed', function(){
    describe('.trans(p)', function(){
	it.skip('should apply a patch, returning the result', asyncgen.async(function*(){
	    var dispMap = {
		foo: {
		    init: function*() {this.value = 0;},
		    bar: function*(ctx, p, u) {
			this.value += p.amount;
			return this.value;
		    },
		},
	    };
	    var otb = new vercast.ObjectTestBed(createOStore(dispMap), 'foo', {});
	    //var r = yield* otb.trans({_type: 
	}));

    });

});
