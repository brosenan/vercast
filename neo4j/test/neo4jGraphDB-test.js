"use strict";
var vercast = require('vercast');
var asyncgen = require('asyncgen');

var graphDB = new vercast.Neo4jGraphDB();

describe('Neo4jGraphDB', function(){
    require('../../test/graphDB-test.js')(graphDB);
    it('should store edges reliably', asyncgen.async(function*(){
	yield* graphDB.addEdge('v0', '1', 'v1');
	yield* graphDB.addEdge('v1', '2', 'v2');
	yield* graphDB.addEdge('v2', '3', 'v3');
	// Assuming a crash, a new instance should contain these edges
	var graphDB2 = new vercast.Neo4jGraphDB();
	yield* graphDB2.findPath('v0', 'v3');
    }));
});
