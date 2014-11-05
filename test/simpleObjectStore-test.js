"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

describe('SinpleObjectStore', function(){
    function createOStroe(classes) {
	var disp = new vercast.ObjectDispatcher(classes);
	return new vercast.SimpleObjectStore(disp);
    }
    describe('.init(type, args)', function(){
	it('should return a version ID of a newly created object', asyncgen.async(function*(done){
	    var called = false;
	    var classes = {
		foo: {
		    init: function*() {
			called = true;
		    },
		},
	    };
	    var ostore = createOStroe(classes);
	    var v = yield* ostore.init('foo', {});
	    assert.equal(typeof v.$, 'string');
	    assert(called, 'The constructor should have been called');
	}));
    });
    describe('.trans(v, p, u) -> {v, r}', function(){
	it('should return the value returned from the method corresponding to patch p', asyncgen.async(function*(done){
	    var classes = {
		foo: {
		    init: function*() {
			this.baz = 0;
		    },
		    bar: function*() {
			this.baz += 1;
			return this.baz;
		    },
		},
	    };
	    var ostore = createOStroe(classes);
	    var v = yield* ostore.init('foo', {});
	    var pair = (yield* ostore.trans(v, {_type: 'bar'}));
	    assert.equal(pair.r, 1);
	    pair = (yield* ostore.trans(pair.v, {_type: 'bar'}));
	}));
    });
});
