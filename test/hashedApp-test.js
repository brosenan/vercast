var HashedApp = require('../hashedApp.js');
var App = require('../app.js');
var util = require('../util.js');
var assert = require('assert');
var Hash = require('../hash.js');
var counter_app = require('./counter-example.js').counter_app;
var DummyKVS = require('../keyvalue.js');

var hash = new Hash(new DummyKVS());
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
	var app = new HashedApp(new App(hash), hash, new DummyKVS());
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
	it('should handle _inv patches', function(done){
	    util.seq([
		function(_) { app.apply(h0, {type: '_inv', patch: {type: 'add', amount: 2}}, _.to('h1', 'r1', 'sf1')); },
		function(_) { assert(this.sf1, 'inverted operation should be safe'); _(); },
		function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
		function(_) { assert.equal(this.r2, -2); _(); },
	    ], done)();
	});
	it('should handle _comp patches', function(done){
	    util.seq([
		function(_) { app.apply(h0, {type: '_comp', patches: [{type: 'add', amount: 1}, 
								      {type: 'add', amount: 2}, 
								      {type: 'add', amount: 3}]}, _.to('h1', 'r1', 'sf1')); },
		function(_) { assert(this.sf1, 'composite operation should be safe'); _(); },
		function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
		function(_) { assert.equal(this.r2, 6); _(); },
	    ], done)();	    
	});
	it('should handle _hashed patches', function(done){
	    util.seq([
		function(_) { hash.hash({type: 'add', amount: 3}, _.to('ph')); },
		function(_) { app.apply(h0, {type: '_hashed', hash: this.ph}, _.to('h1', 'r1', 'sf1')); },
		function(_) { app.apply(this.h1, {type: 'get'}, _.to('h2', 'r2', 'sf2')); },
		function(_) { assert.equal(this.r2, 3); _(); },
	    ], done)();
	});

    });
    describe('trans', function(){
	var h0;
	var app;
	beforeEach(function(done) {
	    var hash = new Hash(new DummyKVS());
	    app  = new HashedApp(new App(hash), hash, new DummyKVS());
	    util.seq([
		function(_) { hash.hash(counter_app, _.to('appHash')); },
		function(_) { app.initialState(this.appHash, _.to('h0')); },
		function(_) { h0 = this.h0; _(); }
	    ], done)();
	});
	it('should return the hash of the target state when given a source state and a patch', function(done){
	    util.seq([
		function(_) { app.trans(h0, {type: 'add', amount: 3}, _.to('h1')); },
		function(_) { app.apply(this.h1, {type: 'get'}, _.to('h1', 'r1')); },
		function(_) { assert.equal(this.r1, 3); _(); },
		function(_) { app.trans(this.h1, {type: 'add', amount: -3}, _.to('h2')); },
		function(_) { assert.equal(this.h2.$hash$, h0.$hash$); _(); },
	    ], done)();
	});
	it('should cache previous calls and only invoke the actual method if the combination of input state and patch have not yet been encountered', function(done){
	    process._counter = 0; // The counter's 'add' method increments this counter as a side effect.
	    util.seq([
		function(_) { app.trans(h0, {type: 'add', amount: 3}, _.to('h1')); },
		function(_) { app.trans(this.h1, {type: 'add', amount: -3}, _.to('h2')); },
		function(_) { app.trans(this.h2, {type: 'add', amount: 3}, _.to('h3')); },
		function(_) { app.trans(this.h3, {type: 'add', amount: -3}, _.to('h4')); },
		function(_) { app.trans(this.h4, {type: 'add', amount: 3}, _.to('h5')); },
		function(_) { app.trans(this.h5, {type: 'add', amount: -3}, _.to('h6')); },
		function(_) { assert.equal(process._counter, 2); _(); }, // We expect only two invocations. The rest should be cached.
	    ], done)();
	});
    });



});
