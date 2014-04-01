var App = require('../app.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var counter_app = require('./counter-example.js').counter_app;
var DummyKVS = require('../keyvalue.js');

var hash = new HashDB(new DummyKVS());
var appHashDB;

describe('application', function(){
    before(function(done) {
	hash.hash(counter_app, util.protect(done, function(err, hash) {
	    appHashDB = hash;
	    done();
	}));
    });
    describe('initialState', function(){
	it('should properly create an initial state', function(done){
	    var app = new App(hash);
	    util.seq([
		function(_) { app.initialState(appHashDB, _.to('s0')); },
		function(_) { assert.equal(this.s0.val, 0); _(); },
	    ], done)();
	});
    });
    describe('apply', function(){
	var app;
	var state;
	beforeEach(function(done) {
	    app = new App(hash);
	    util.seq([
		function(_) { app.initialState(appHashDB, _.to('s0')); },
		function(_) { state = this.s0; _(); },
	    ], done)();
	});
	it('should return the query result based on the state', function(done){
	    util.seq([
		function(_) { app.apply(state, {type: 'get'}, _.to('val', 'sf')); },
		function(_) { assert.equal(this.val, 0); _(); },
	    ], done)();
	});
	it('should apply the patch to the state', function(done){
	    util.seq([
		function(_) { app.apply(state, {type: 'add', amount:2}, _); },
		function(_) { app.apply(state, {type: 'get'}, _.to('val')); },
		function(_) { assert.equal(this.val, 2); _(); },
	    ], done)();
	});
    });

    describe('inv', function(){
	it('should invert patches', function(done){
	    var app = new App(hash);
	    util.seq([
		function(_) { app.inv(appHashDB, {type: 'add', amount: 2}, _.to('inv')); },
		function(_) { assert.equal(this.inv.type, 'add');
			      assert.equal(this.inv.amount, -2); 
			      _();},
	    ], done)();
	});

    });



});
