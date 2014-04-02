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

    });

});
