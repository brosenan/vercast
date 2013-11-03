var VCObj = require('../vcobj.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

describe('CVObj', function(){
    describe('createObject(cls, s0, cb(err, h0))', function(){
	it('should create an object state hash for the given class and initial state', function(done){
	    var hashDB = new HashDB(new DummyKVS());
	    var obj = new VCObj(hashDB);
	    var cls = { foo: function() { console.log("bar"); }, 
			bar: function() { console.log("baz"); } };
	    util.seq([
		function(_) { obj.createObject(cls, {val:0}, _.to('h0')); },
		function(_) { hashDB.unhash(this.h0, _.to('s0')); },
		function(_) { assert.equal(this.s0.val, 0);
			      hashDB.unhash(this.s0._class, _.to('cls'));},
		function(_) { assert.equal(this.cls.foo, 'function () { console.log("bar"); }'); _(); },
	    ], done)();
	});
    });
    describe('apply(h1, patch, cb(err, h2, res, effect, sf))', function(){
	it('should apply a patch to the given state, activating a class method', function(done){
	    var rand = Math.random();
	    var cls = {
		foo: function(p, cb) { process._beenThere = p.rand; cb(); }
	    };
	    var obj = new VCObj(new HashDB(new DummyKVS()));
	    util.seq([
		function(_) { obj.createObject(cls, {}, _.to('h0')); },
		function(_) { obj.apply(this.h0, {type: 'foo', rand: rand}, _); },
		function(_) { assert.equal(process._beenThere, rand); _(); },
	    ], done)();
	});

    });

});
