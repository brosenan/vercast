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
    it('should properly create an initial state', function(done){
	var app = new App(hash);
	util.seq([
	    function(_) { app.initialState(appHash, _.to('s0')); },
	    function(_) { assert.equal(this.s0.val, 0); _(); },
	], done)();
    });

});
