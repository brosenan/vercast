"use strict";
var assert = require('assert');

var vercast = require('vercast');
var asyncgen = require('asyncgen');

var newKey = function() {
    return 'k' + Math.floor(Math.random() * 1000000000);
}

var graphDB = new vercast.DummyGraphDB();

describe('DummyGraphDB', function(){
    require('./graphDB-test.js')(graphDB);
    describe('.remove(vertex)', function(){
	it('should remove all edges pointing to and from the given vertex', asyncgen.async(function*(){
	    var key = newKey();
	    yield* graphDB.addEdge(key + 'X', "a", key + 'Y');
	    yield* graphDB.addEdge(key + 'X', "b", key + 'Z');
	    yield* graphDB.addEdge(key + 'W', "c", key + 'X');
	    yield* graphDB.remove(key + 'X');
	    try {
		yield* graphDB.queryEdge(key + "X", "likes");
		assert(false, 'Should not find and edge');
	    } catch(e) {
		assert.equal(e.message, 'Vertex ' + key + 'X not found');
	    }
	    assert.equal(typeof (yield* graphDB.queryBackEdge(key + "Y", "a")), 'undefined');
	    assert.equal(typeof (yield* graphDB.queryEdge(key + "W", "c")), 'undefined');
	}));

    });

});
