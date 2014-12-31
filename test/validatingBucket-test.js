"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

describe('createValidatingBucket(createBucket)', function(){
    describe('.store(obj, emit)', function(){
	it('should consult the underlying .store() method', function(){
	    function createBucket() {
		return {
		    store: function(obj, emit) {
			emit({a:1});
			return {obj: obj};
		    }
		};
	    }
	    var emitted = [];
	    function emit(elem) {
		emitted.push(elem);
	    }

	    var validatingBucket = vercast.createValidatingBucket(createBucket);
	    var res = validatingBucket.store({x:2}, emit);
	    assert.equal(res.obj.x, 2);
	    assert.deepEqual(emitted, [{a:1}]);
	});
    });
    describe('.storeIncoming(v, p, monitor, r, eff, emit)', function(){
	it('should consult the underlying .storeIncoming() method', function(){
	    function createBucket() {
		return {
		    storeIncoming: function(v, p, monitor, r, eff, emit) {
			emit({a:2});
			return {v:v, p:p, obj: monitor.object(), r: r, eff:eff};
		    },
		};
	    }
	    var emitted = [];
	    function emit(elem) {
		emitted.push(elem);
	    }

	    var validatingBucket = vercast.createValidatingBucket(createBucket);
	    var res = validatingBucket.storeIncoming('1234', 
						     {_type: 'somePatch'}, 
						     new vercast.ObjectMonitor({_type: 'someObj'}), 
						     123, 'someEff', emit);
	    assert.equal(res.v, '1234');
	    assert.deepEqual(res.p, {_type: 'somePatch'});
	    assert.deepEqual(res.obj, {_type: 'someObj'});
	    assert.equal(res.r, 123);
	    assert.equal(res.eff, 'someEff');
	    assert.deepEqual(emitted, [{a:2}]);
	});
    });
    describe('.storeOutgoing(v, p, monitor, r, eff, emit)', function(){
	it('should consult the underlying .storeIncoming() method', function(){
	    function createBucket() {
		return {
		    storeOutgoing: function(v, p, monitor, r, eff, emit) {
			emit({a:3});
			return {v:v, p:p, obj: monitor.object(), r: r, eff:eff};
		    },
		};
	    }
	    var emitted = [];
	    function emit(elem) {
		emitted.push(elem);
	    }

	    var validatingBucket = vercast.createValidatingBucket(createBucket);
	    var res = validatingBucket.storeOutgoing('1234', 
						     {_type: 'somePatch'}, 
						     new vercast.ObjectMonitor({_type: 'someObj'}), 
						     123, 'someEff', emit);
	    assert.equal(res.v, '1234');
	    assert.deepEqual(res.p, {_type: 'somePatch'});
	    assert.deepEqual(res.obj, {_type: 'someObj'});
	    assert.equal(res.r, 123);
	    assert.equal(res.eff, 'someEff');
	    assert.deepEqual(emitted, [{a:3}]);
	});
    });
    describe('.storeInternal(v, p, monitor, r, eff, emit)', function(){
	it('should consult the underlying .storeIncoming() method', function(){
	    function createBucket() {
		return {
		    storeInternal: function(v, p, monitor, r, eff, emit) {
			emit({a:4});
			return {v:v, p:p, obj: monitor.object(), r: r, eff:eff};
		    },
		};
	    }
	    var emitted = [];
	    function emit(elem) {
		emitted.push(elem);
	    }

	    var validatingBucket = vercast.createValidatingBucket(createBucket);
	    var res = validatingBucket.storeInternal('1234', 
						     {_type: 'somePatch'}, 
						     new vercast.ObjectMonitor({_type: 'someObj'}), 
						     123, 'someEff', emit);
	    assert.equal(res.v, '1234');
	    assert.deepEqual(res.p, {_type: 'somePatch'});
	    assert.deepEqual(res.obj, {_type: 'someObj'});
	    assert.equal(res.r, 123);
	    assert.equal(res.eff, 'someEff');
	    assert.deepEqual(emitted, [{a:4}]);
	});
    });

});
