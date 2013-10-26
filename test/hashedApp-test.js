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
    describe('apply', function(){
	var h0;
	var app = new HashedApp(new App(hash), hash);
	beforeEach(function(done) {
	    util.seq([
		function(_) { app.initialState(appHash, _.to('h0')); },
		function(_) { h0 = this.h0; _(); }
	    ], done)();
	});
	it('should calculate the hash of the new state, the computation result and the safety flag, based on an original state and a patch', function(done){
	    util.seq([
		function(_) { app.apply(h0, {type: 'add', amount: 2}, _.to('h1', 'r1', 'sf1')); },
		function(_) { assert(this.sf1, 'sf must be true'); _(); },
		function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
		function(_) { assert(this.sf2, 'sf must be true');
			      assert.equal(this.r2, 2);
			      assert.equal(this.h2.$hash$, this.h1.$hash$);
			      _();},
		function(_) { app.apply(this.h2, {type: 'add', amount: -2}, _.to('h3', 'r3', 'sf3')); },
		function(_) { assert.equal(this.h3.$hash$, h0.$hash$); _(); },
	    ], done)();
	});

    });


});
