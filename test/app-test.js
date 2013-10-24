var App = require('../app.js');
var util = require('../util.js');
var assert = require('assert');
var Hash = require('../hash.js');

// Example application
var counter_app = convertApp({
    do_get: function(patch, ctx, _) {
	_(undefined, this.val, true);
    },
    do_add: function(patch, ctx, _) {
	this.val += patch.amount;
	_(undefined, undefined, true);
    },
    inv_add: function(patch) {
	patch.amount *= -1;
	return patch;
    },
    init: function() {
	this.val = 0;
    }
});

function convertApp(app) {
    var convApp = {};
    for(var key in app) {
	convApp[key] = app[key].toString();
    }
    return convApp;
}

var hash = new Hash();
var appHash;

describe('application', function(){
    before(function(done) {
	hash.hash(counter_app, util.protect(done, function(err, hash) {
	    appHash = hash;
	    done();
	}));
    });
    describe('initialState', function(){
	it('should properly create an initial state', function(done){
	    var app = new App(hash);
	    util.seq([
		function(_) { app.initialState(appHash, _.to('s0')); },
		function(_) { assert.equal(this.s0.val, 0); _(); },
	    ], done)();
	});
    });
    describe('query', function(){
	var app;
	var s0;
	beforeEach(function(done) {
	    app = new App(hash);
	    util.seq([
		function(_) { app.initialState(appHash, _.to('s0')); },
		function(_) { s0 = this.s0; _(); },
	    ], done)();
	});
	it('should return the query result based on the state', function(done){
	    util.seq([
		function(_) { app.query(s0, {type: 'get'}, _.to('val', 'sf')); },
		function(_) { assert.equal(this.val, 0); _(); },
	    ], done)();
	});

    });

    describe('apply', function(){
	var app;
	var state;
	beforeEach(function(done) {
	    app = new App(hash);
	    util.seq([
		function(_) { app.initialState(appHash, _.to('s0')); },
		function(_) { state = this.s0; _(); },
	    ], done)();
	});
	it('should apply the patch to the state', function(done){
	    util.seq([
		function(_) { app.apply(state, {type: 'add', amount:2}, _); },
		function(_) { app.query(state, {type: 'get'}, _.to('val')); },
		function(_) { assert.equal(this.val, 2); _(); },
	    ], done)();
	});

    });


});
