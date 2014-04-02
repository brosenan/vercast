assert = require('assert');
ObjectDisp = require('../objectDisp.js');

describe('ObjectDisp', function(){
    describe('.init(ctx, className, args)', function(){
	it('should call the init() function associated with the class', function(done){
	    var called = false;
	    disp = {
		'MyClass': {init: function() { called = true; }}
	    }
	    objDisp = new ObjectDisp(disp);
	    objDisp.init({}, 'MyClass', {});
	    assert(called, 'Function should have been called');
	    done();
	});
	it('should throw an exception if the class does not exist', function(done) {
	    var objDisp = new ObjectDisp({});
	    try {
		objDisp.init({}, 'MyClass', {});
		assert(false, 'Exception should have been thrown');
	    } catch(e) {
		assert.equal(e.message, "Class MyClass not defined");
	    }
	    done();	    
	});
	it('should pass the given context and args to the class\'s init() function', function(done){
	    var called = false;
	    disp = {
		'MyClass': {init: function(ctx, args) {
		    assert.equal(ctx, 'foo');
		    assert.equal(args, 'bar');
		    called = true; 
		}}
	    }
	    objDisp = new ObjectDisp(disp);
	    objDisp.init('foo', 'MyClass', 'bar');
	    assert(called, 'Function should have been called');
	    done();
	});
	it('should return the value returned by the class\'s init() function', function(done){
	    disp = {
		'MyClass': {init: function(ctx, args) { return 'foobar'; }}
	    }
	    objDisp = new ObjectDisp(disp);
	    var ret = objDisp.init({}, 'MyClass', {});
	    assert.equal(ret, 'foobar');
	    done();
	});
    });
});
