var assert = require('assert');
var util = require('../util.js');

module.exports = function(atomicKV) {
    describe('as AtomicKeyValue', function(){
	beforeEach(function(done) {
	    atomicKV.clear(done);
	});
	describe('.newKey(key, val, cb(err))', function(){
	    it('should store a new key/value pair, given that key does not already exist', function(done){
		util.seq([
		    function(_) { atomicKV.newKey('foo', 'bar', _); },
		    function(_) { atomicKV.retrieve('foo', _.to('value')); },
		    function(_) { assert.equal(this.value, 'bar'); _(); },
		], done)();
	    });
	    it('should emit an error when the key already exists', function(done){
		util.seq([
		    function(_) { atomicKV.newKey('foo', 'bar', _); },
		    function(_) { atomicKV.newKey('foo', 'bar', _); },
		], function(err) {
		    assert(err, 'An error should be emitted');
		    done(err.message == 'Key foo already exists' ? undefined : err);
		})();
	    });
	});
	describe('.retrieve(key, cb(err, val))', function(){
	    it('should emit an error if the value does not exist', function(done){
		util.seq([
		    function(_) { atomicKV.retrieve('foo', _.to('value')); },
		    function(_) { assert(false, 'the value is not supposed to be found'); _(); },
		], function(err) {
		    assert(err, 'An error should be emitted');
		    done(err.message == 'Key foo was not found' ? undefined : err);
		})();
	    });
	});
	describe('.modify(key, oldVal, newVal, cb(err, valAfterMod))', function(){
	    it('should change the value under key to newVal, given that the previous value was oldVal', function(done){
		util.seq([
		    function(_) { atomicKV.newKey('foo', 'bar', _); },
		    function(_) { atomicKV.modify('foo', 'bar', 'baz', _.to('valAfterMod')); },
		    function(_) { assert.equal(this.valAfterMod, 'baz'); _(); },
		    function(_) { atomicKV.retrieve('foo', _.to('val')); },
		    function(_) { assert.equal(this.val, 'baz'); _(); },
		], done)();
	    });
	    it('should not change the value under key if the current value does not equal oldVal', function(done){
		util.seq([
		    function(_) { atomicKV.newKey('foo', 'bar', _); },
		    function(_) { atomicKV.modify('foo', 'baz', 'bat', _.to('valAfterMod')); },
		    function(_) { assert.equal(this.valAfterMod, 'bar'); _(); }, // The value before the change
		    function(_) { atomicKV.retrieve('foo', _.to('val')); },
		    function(_) { assert.equal(this.val, 'bar'); _(); },
		], done)();
	    });
	});
    });
};