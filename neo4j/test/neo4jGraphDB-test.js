"use strict";
var vercast = require('vercast');

describe('Neo4jGraphDB', function(){
    require('../../test/graphDB-test.js')(new vercast.Neo4jGraphDB());
});
