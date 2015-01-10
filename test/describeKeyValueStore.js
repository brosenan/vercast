"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var newKey = function() {
    return 'k' + Math.floor(Math.random() * 1000000000);
}

module.exports = function(kvs) {
    describe('as KeyValueStore', function(){
	it('should retrieve stored values', asyncgen.async(function*(){
	    var key = newKey();
	    yield* kvs.store(key, 'bar');
	    assert.equal(yield* kvs.fetch(key), 'bar');
	}));
    });
};
