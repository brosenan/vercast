"use strict";
var assert = require('assert');

var vercast = require('vercast');
var asyncgen = require('asyncgen');

var newKey = function() {
    return 'k' + Math.floor(Math.random() * 1000000000);
}

var bucketStore = new vercast.DummyBucketStore();

var identity = function(id) { return id; };
var universal = function(id) { return 'oneAndOnly'; };

var graphDB1 = new vercast.ClusteredGraphDB(new vercast.DummyGraphDB(), bucketStore, 100, identity);
var graphDB2 = new vercast.ClusteredGraphDB(new vercast.GraphCache(1), bucketStore, 100, universal);

describe('ClusteredGraphDB', function(){
    describe('with identity clustering', function(){
	require('./graphDB-test.js')(graphDB1);
    });
    describe('with universal clustering', function(){
	require('./graphDB-test.js')(graphDB2);
    });
//    it('should be able to find paths in graphs bigger than the cache, as long as the path is smaller', function(done){
//	var graphDB = new vercast.ClusteredGraphDB(new vercast.DummyGraphDB(),
//						   new vercast.DummyBucketStore(),
//						   10,
//						   identity);
//	
//    });

});
