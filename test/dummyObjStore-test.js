assert = require('assert');
ObjectDisp = require('../objectDisp.js');
DummyObjectStore = require('../dummyObjectStore.js');

var disp = new ObjectDisp({
    Counter: require('../counter.js')
});
var ostore = new DummyObjectStore(disp);

describe('DummyObjectStore', function(){
    describe('.init(ctx, className, args)', function(){
	it('should call the init() method of the relevant class with args as a parameter', function(done){
	    var called = false;
	    var disp = new ObjectDisp({
		MyClass: {
		    init: function(ctx, args) {
			assert.equal(args.foo, 2);
			called = true;
		    }
		}
	    });
	    var ostore = new DummyObjectStore(disp);
	    ostore.init('bar', 'MyClass', {foo: 2});
	    assert(called, 'MyClass.init() should have been called');
	    done();
	});

	it('should return an ID (an object with a "$" attribute containing a string) of the newly created object', function(done){
	    var id = ostore.init({}, 'Counter', {});
	    assert.equal(typeof id.$, 'string');
	    done();
	});

    });
    describe('.trans(ctx, v1, p)', function(){
	it('should apply patch p to version v1 (v1 is a version ID), returning pair [v2, res] where v2 is the new version ID, and res is the result', function(done){
	    var v0 = ostore.init({}, 'Counter', {});
	    var pair = ostore.trans({}, v0, {_type: 'add', amount: 10});
	    var v1 = pair[0];
	    pair = ostore.trans({}, v1, {_type: 'get'});
	    var res = pair[1];
	    assert.equal(res, 10);
	    done();
	});
    });
    describe('context', function(){
	it('should allow underlying initializations and transitions to perform initializations and transitions', function(done){
	    var disp = new ObjectDisp({
		MyClass: {
		    init: function(ctx, args) {
			this.counter = ctx.init('Counter', {});
		    },
		    patchCounter: function(ctx, p) {
			var pair = ctx.trans(this.counter, p.p)
			this.counter = pair[0];
			return pair[1];
		    },
		},
		Counter: require('../counter.js'),
	    });
	    var ostore = new DummyObjectStore(disp);
	    var v = ostore.init({}, 'MyClass', {});
	    v = ostore.trans({}, v, {_type: 'patchCounter', p: {_type: 'add', amount: 5}})[0];
	    r = ostore.trans({}, v, {_type: 'patchCounter', p: {_type: 'get'}})[1];
	    assert.equal(r, 5);
	    done();
	});
    });
});
