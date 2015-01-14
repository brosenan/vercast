"use strict";
var assert = require('assert');

var vercast = require('vercast');
var asyncgen = require('asyncgen');

var newKey = function() {
    return 'k' + Math.floor(Math.random() * 1000000000);
}

var graphCache = new vercast.GraphCache(100);

describe('GraphCache', function(){
    require('./graphDB-test.js')(graphCache);

    it('should remove vertexes that exceed the specified capacity', asyncgen.async(function*(){
	for(let i = 0; i < 99; i++) {
	    yield* graphCache.addEdge('v' + i, 'e', 'v' + (i+1));
	}
	yield* graphCache.findPath('v0', 'v99'); // Should not fail
	// Adding the one that exceeds...
	yield* graphCache.addEdge('v99', 'e', 'v100');
	try {
	    yield* graphCache.findPath('v0', 'v1'); // Should be removed per LRU
	    assert(false, 'Should fail');
	} catch(e) {
	    assert.equal(e.message, 'v0 is not a node in the graph');
	}
    }));
    it('should recall vertexes that were used in a found path', asyncgen.async(function*(){
	yield* graphCache.addEdge('v0', 'xa', 'x1');
	yield* graphCache.addEdge('x1', 'xb', 'x2');
	yield* graphCache.addEdge('v0', 'ya', 'y1');
	yield* graphCache.addEdge('y1', 'yb', 'y2');
	for(let i = 0; i < 95; i++) {
	    yield* graphCache.addEdge('v' + i, 'e', 'v' + (i+1));
	}
	yield* graphCache.findPath('v0', 'v95'); // Should not fail
	yield* graphCache.findPath('v0', 'x2'); // Should not fail
	yield* graphCache.findPath('v0', 'y2'); // Should not fail
	// The following should recall the edges between v0 and x2 and y2
	yield* graphCache.findCommonAncestor('x2', 'y2');
	for(let i = 95; i < 99; i++) {
	    yield* graphCache.addEdge('v' + i, 'e', 'v' + (i+1));
	}
	yield* graphCache.findPath('v0', 'x2'); // Should not fail
	yield* graphCache.findPath('v0', 'y2'); // Should not fail
	try {
	    yield* graphCache.findPath('v0', 'v95');
	    assert(false, 'Should fail');
	} catch(e) {
	    assert.equal(e.message, 'Could not find path from v0 to v95');
	}
    }));
    describe('.has(v)', function(){
	it('should return true iff vertex v is currently in the cache', asyncgen.async(function*(){
	    for(let i = 0; i < 99; i++) {
		yield* graphCache.addEdge('v' + i, 'e', 'v' + (i+1));
	    }
	    assert(graphCache.has('v0'), "graphCache.has('v0')");
	    // Adding the one that exceeds...
	    yield* graphCache.addEdge('v99', 'e', 'v100');
	    assert(!graphCache.has('v0'), "!graphCache.has('v0')");
	}));
    });
    describe('explicit-cleanup', function(){
	it('should not clean-up vertexes automatically if this flag has been set', asyncgen.async(function*(){
	    var graphCache = new vercast.GraphCache(100, true);
	    for(let i = 0; i < 200; i++) {
		yield* graphCache.addEdge('v' + i, 'e', 'v' + (i+1));
	    }
	    assert(graphCache.has('v0'), "graphCache.has('v0')");
	}));
    });
    describe('.cleanup()', function(){
	it('should clean-up old vertexes leaving only the allowed capacity', asyncgen.async(function*(){
	    var graphCache = new vercast.GraphCache(100, true);
	    for(let i = 0; i < 100; i++) {
		yield* graphCache.addEdge('v' + i, 'e', 'v' + (i+1));
	    }
	    assert(graphCache.has('v0'), "graphCache.has('v0')");
	    yield* graphCache.cleanup();
	    assert(!graphCache.has('v0'), "!graphCache.has('v0')");
	    assert(graphCache.has('v1'), "graphCache.has('v1')");
	}));
    });

});
