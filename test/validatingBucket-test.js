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
		    },
		    add: function() {},
		};
	    }
	    var emitted = [];
	    function emit(elem) {
		emitted.push(elem);
	    }

	    var validatingBucket = vercast.createValidatingBucket(createBucket)('foo');
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
		    add: function() {},
		};
	    }
	    var emitted = [];
	    function emit(elem) {
		emitted.push(elem);
	    }

	    var validatingBucket = vercast.createValidatingBucket(createBucket)('foo');
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
		    add: function() {},
		};
	    }
	    var emitted = [];
	    function emit(elem) {
		emitted.push(elem);
	    }

	    var validatingBucket = vercast.createValidatingBucket(createBucket)('foo');
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
		    add: function() {},
		};
	    }
	    var emitted = [];
	    function emit(elem) {
		emitted.push(elem);
	    }

	    var validatingBucket = vercast.createValidatingBucket(createBucket)('foo');
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
    describe('.checkCache(v, p)', function(){
	it('should consult the underlying .checkCache() method', function(){
	    function createBucket() {
		return {
		    checkCache: function(v, p) {
			return {v: v, p: p};
		    },
		};
	    }
	    var validatingBucket = vercast.createValidatingBucket(createBucket)('foo');
	    var res = validatingBucket.checkCache('1234-5678', {_type: 'somePatch'});

	    assert.equal(res.v, '1234-5678');
	    assert.deepEqual(res.p, {_type: 'somePatch'});
	});
	it('should validate that the same value is provided for the same ID when using ths store*() methods or the emit/add cycle', function(){
	    function calcKey(v, p) {
		return v + ">" + vercast.ObjectMonitor.seal(p);
	    }
	    function createBucket() {
		var kvs = {};
		return {
		    storeIncoming: function(v, p, monitor, r, eff, emit) {
			var key = calcKey(v, p);
			emit({key: key, obj: monitor.object()}); // good
			kvs[key] = monitor.object();
			return '1234';
		    },
		    storeOutgoing: function(v, p, monitor, r, eff, emit) {
			// Bad: does not change own state
			var key = calcKey(v, p);
			emit({key: key, obj: monitor.object()});
		    },
		    storeInternal: function(v, p, monitor, r, eff, emit) {
			// Bad: Does not emit
			var key = calcKey(v, p);
			kvs[key] = monitor.object();
			return '1234';
		    },
		    add: function(elem) {
			kvs[elem.key] = elem.obj;
		    },
		    checkCache: function(v, p) {
			return kvs[calcKey(v, p)];
		    },
		};
	    }
	    function emit(elem) {};
	    var validatingBucket = vercast.createValidatingBucket(createBucket)('foo');
	    validatingBucket.storeIncoming('1234', 
					   {_type: 'somePatch'}, 
					   new vercast.ObjectMonitor({_type: 'someObj'}),
					   undefined, '', emit);
	    var obj = validatingBucket.checkCache('1234', {_type: 'somePatch'});
	    assert.equal(obj._type, 'someObj');
	    validatingBucket.storeOutgoing('1234', 
					   {_type: 'somePatch'}, 
					   new vercast.ObjectMonitor({_type: 'someObj1', foo: 2}),
					   undefined, '', emit);
	    assert.throws(function() {
		validatingBucket.checkCache('1234', {_type: 'somePatch'});
	    }, /Mismatch in return value between stored and added state/);

	    validatingBucket.storeInternal('1234', 
					   {_type: 'somePatch'}, 
					   new vercast.ObjectMonitor({_type: 'someObj2'}),
					   undefined, '', emit);
	    assert.throws(function() {
		validatingBucket.checkCache('1234', {_type: 'somePatch'});
	    }, /Mismatch in return value between stored and added state/);
	});
    });
    describe('.retrieve(id)', function(){
	it('should consult the underlying .retrieve() method', function(){
	    function createBucket() {
		return {
		    retrieve: function(id) {
			return new vercast.ObjectMonitor({id: id});
		    },
		};
	    }
	    var validatingBucket = vercast.createValidatingBucket(createBucket)('foo');
	    var res = validatingBucket.retrieve('1234');

	    assert.equal(res.proxy().id, '1234');
	});
	it('should validate that the same value is provided for the same ID when using ths store*() methods or the emit/add cycle', function(){
	    function createBucket() {
		var kvs = {};
		return {
		    store: function(obj, emit) {
			// Bad: changes own state but does not emit
			var key = obj._type;
			kvs[key] = obj;
			return key;
		    },
		    storeIncoming: function(v, p, monitor, r, eff, emit) {
			emit(monitor.object()); // good
			var id = this.store(monitor.object());
			return id;
		    },
		    storeOutgoing: function(v, p, monitor, r, eff, emit) {
			// Bad: does not change own state
			emit(monitor.object()); 
		    },
		    storeInternal: function(v, p, monitor, r, eff, emit) {
			// Bad: Emits one thing, changes state to another
			emit({_type: 'someObj2', bar: 4});
			var id = this.store(monitor.object());
			return id;
		    },
		    retrieve: function(id) {
			return new vercast.ObjectMonitor(kvs[id]);
		    },
		    add: function(elem) {
			this.store(elem);
		    },
		};
	    }
	    function emit(elem) {};
	    var validatingBucket = vercast.createValidatingBucket(createBucket)('foo');
	    var id = validatingBucket.store({_type: 'someObj'}, emit);
	    assert.throws(function() {
		var monitor = validatingBucket.retrieve(id);
	    }, /Mismatch in return value between stored and added state/);
	    id = validatingBucket.storeIncoming('1234', 
						{_type: 'somePatch'}, 
						new vercast.ObjectMonitor({_type: 'someOtherObj'}),
						undefined, '', emit);
	    validatingBucket.retrieve(id); // should be OK
	    validatingBucket.storeOutgoing('1234', 
					   {_type: 'somePatch'}, 
					   new vercast.ObjectMonitor({_type: 'someObj1', foo: 2}),
					   undefined, '', emit);
	    assert.throws(function() {
		validatingBucket.retrieve('someObj1');
	    }, /Mismatch in return value between stored and added state/);

	    validatingBucket.storeInternal('1234', 
					   {_type: 'somePatch'}, 
					   new vercast.ObjectMonitor({_type: 'someObj2'}),
					   undefined, '', emit);
	    assert.throws(function() {
		validatingBucket.retrieve('someObj2');
	    }, /Mismatch in return value between stored and added state/);
	    
	});

    });
    describe('.add(elem)', function(){
	it('should forward elem to two instances of this bucket', function(){
	    var added = [];
	    function createBucket() {
		return {
		    add: function(elem) {
			added.push(elem);
		    },
		};
	    }
	    var validatingBucket = vercast.createValidatingBucket(createBucket)('foo');
	    validatingBucket.add({a:1});
	    validatingBucket.add({a:2});

	    assert.deepEqual(added, [{a:1}, {a:1}, {a:2}, {a:2}]);
	});
    });
});
