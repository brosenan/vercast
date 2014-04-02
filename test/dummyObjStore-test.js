assert = require('assert');
ObjectDisp = require('../objectDisp.js');
DummyObjectStore = require('../dummyObjectStore.js');

var disp = new ObjectDisp({
    Counter: require('../counter.js')
});
var ostore = new DummyObjectStore(disp);

describe('DummyObjectStore', function(){
    describe('.init(ctx, className, args)', function(){
	it('should call the init() method of the relevant class with ctx and args as parameters', function(done){
	    var called = false;
	    var disp = new ObjectDisp({
		MyClass: {
		    init: function(ctx, args) {
			assert.equal(args.foo, 2);
			assert.equal(ctx, 'bar');
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
    describe('.trans(ctx, v, p)', function(){

    });

});
