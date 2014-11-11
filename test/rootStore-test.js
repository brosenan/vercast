"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

function createOStore(dispMap) {
    var kvs = new vercast.DummyKeyValueStore();
    var disp = new vercast.ObjectDispatcher(dispMap);
    return new vercast.DummyObjectStore(disp);
}

describe('RootStore', function(){
    describe('.init(type, args)', function(){
	it('should return an initial version ID of a new object', asyncgen.async(function*(){
	    var called = false;
	    var dispMap = {
		foo: {
		    init: function*() { called = true; },
		},
	    };
	    var rootStore = new vercast.RootStore(createOStore(dispMap));
	    var v = yield* rootStore.init('foo', {});
	    assert(called, 'constructor should have been called');
	}));
    });

});
