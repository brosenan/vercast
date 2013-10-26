var HashedApp = require('../hashedApp.js');
var App = require('../app.js');
var util = require('../util.js');
var assert = require('assert');
var Hash = require('../hash.js');
var counter_app = require('./counter-example.js').counter_app;

var hash = new Hash();
var appHash;

describe('HashedApp', function(){
    before(function(done) {
	hash.hash(counter_app, util.protect(done, function(err, hash) {
	    appHash = hash;
	    done();
	}));
    });
    describe('initialState', function(){
	it('should return the initial state\'s hash', function(done){
	    var app = new HashedApp(new App(hash), hash);
	    util.seq([
		function(_) { app.initialState(appHash, _.to('h0')); },
		function(_) { assert.equal(typeof this.h0.$hash$, 'string'); _(); },
		function(_) { hash.unhash(this.h0, _.to('s0')); },
		function(_) { assert.equal(this.s0.val, 0); _(); },
	    ], done)();
	});

    });

});
