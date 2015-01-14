"use strict";
var assert = require('assert');

var vercast = require('vercast');
var asyncgen = require('asyncgen');

var newKey = function() {
    return 'k' + Math.floor(Math.random() * 1000000000);
}

var externalGraphDB = new vercast.DummyGraphDB();
var graphDB1 = new vercast.ClusteredGraphDB(externalGraphDB, function(id) {
    return id;
});
var graphDB2 = new vercast.ClusteredGraphDB(externalGraphDB, function(id) {
    return 'oneAndOnly';
});

describe('ClusteredGraphDB', function(){
    require('./graphDB-test.js')(graphDB1);
    require('./graphDB-test.js')(graphDB2);
});
