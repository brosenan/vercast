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
	it('should return the value of the "this" object in the context of the class\'s init() function', function(done){
	    disp = {
		'MyClass': {init: function(ctx, args) { this.name = "foobar" }}
	    }
	    objDisp = new ObjectDisp(disp);
	    var ret = objDisp.init({}, 'MyClass', {});
	    assert.equal(ret.name, 'foobar');
	    done();
	});
	it('should add a _type field to the returned object, containing the class name', function(done){
	    disp = {
		'MyClass': {init: function(ctx, args) { this.name = 'foobar'; }}
	    }
	    objDisp = new ObjectDisp(disp);
	    var ret = objDisp.init({}, 'MyClass', {});
	    assert.equal(ret._type, 'MyClass');
	    done();
	});

    });
    describe('.apply(ctx, obj, patch, unapply)', function(){
	it('should call the function with name matches the _type field of the patch, in the class associated with the object.', function(done){
	    var called = false;
	    disp = {
		'MyClass': {
		    init: function() {},
		    patch1: function () { called = true; },
		}
	    }
	    objDisp = new ObjectDisp(disp);
	    var ctx = {};
	    var obj = objDisp.init(ctx, 'MyClass', {});
	    objDisp.apply(ctx, obj, {_type: 'patch1'});
	    assert(called, 'Function should have been called');
	    done();
	});
	it('should throw an exception if the patch function is not defined', function(done){
	    var called = false;
	    disp = {
		'MyClass': {
		    init: function() {},
		    patch1: function () { called = true; },
		}
	    }
	    objDisp = new ObjectDisp(disp);
	    var ctx = {};
	    var obj = objDisp.init(ctx, 'MyClass', {});
	    try {
		objDisp.apply(ctx, obj, {_type: 'patch2'});
		assert(false, 'Exception should have been raised');
	    } catch(e) {
		assert.equal(e.message, 'Patch method patch2 is not defined in class MyClass');
	    }
	    done();
	});
	it('should pass the object as the "this" parameter to the patch function', function(done){
	    var called = false;
	    disp = {
		'MyClass': {
		    init: function() { this.name = 'foo'; },
		    patch1: function () {
			assert.equal(this.name, 'foo');
			called = true;
		    },
		}
	    }
	    objDisp = new ObjectDisp(disp);
	    var ctx = {};
	    var obj = objDisp.init(ctx, 'MyClass', {});
	    objDisp.apply(ctx, obj, {_type: 'patch1'});
	    assert(called, 'Function should have been called');
	    done();
	});
	it('should pass the context, the patch and the unapply flag as parameters to the patch function', function(done){
	    disp = {
		'MyClass': {
		    init: function() { },
		    patch1: function (ctx, patch, unapply) {
			assert.equal(ctx.foo, 'bar');
			assert.equal(patch.bar, 'baz');
			assert(unapply, 'The unapply flag should have been set');
		    },
		}
	    }
	    objDisp = new ObjectDisp(disp);
	    var ctx = {foo: 'bar'};
	    var obj = objDisp.init(ctx, 'MyClass', {});
	    objDisp.apply(ctx, obj, {_type: 'patch1', bar: 'baz'}, true);
	    done();
	});
	it('should return a pair [obj, res], containing the patch function\'s "this" object, and its return value', function(done){
	    disp = {
		'MyClass': {
		    init: function() { this.name = 'foo'; },
		    patch1: function (ctx, patch) {
			var old = this.name;
			this.name = patch.name;
			return old;
		    },
		}
	    }
	    objDisp = new ObjectDisp(disp);
	    var ctx = {};
	    var obj = objDisp.init(ctx, 'MyClass', {});
	    res = objDisp.apply(ctx, obj, {_type: 'patch1', name: 'bar'});
	    assert.equal(res[0].name, 'bar');
	    assert.equal(res[1], 'foo');
	    done();
	});
	it('should use patch handlers if defined (prfixed with ":"), and should prefer them over class methods', function(done){
	    var called = false;
	    disp = {
		'MyClass': {
		    init: function() { this.name = 'foo'; },
		    patch1: function (ctx, patch) {
			assert(false, 'Class method should not run');
		    },
		    get: function(ctx, patch) {
			return this.name;
		    },
		},
		':patch1': function(ctx, obj, patch) {
		    called = true;
		    // We get the patch from the caller
		    assert.equal(patch.name, 'bar');
		    // and the object
		    assert.equal(obj.name, 'foo');
		    // "this" is the object dispatcher
		    var pair = this.apply(ctx, obj, {_type: 'get'});
		    assert(pair[1], 'foo');
		    
		    obj.name = 'bazz';
		    return 2;
		},
	    }
	    objDisp = new ObjectDisp(disp);
	    var ctx = {};
	    var obj = objDisp.init(ctx, 'MyClass', {});
	    res = objDisp.apply(ctx, obj, {_type: 'patch1', name: 'bar'});
	    assert(called, 'patch function should have been called');
	    assert.equal(res[0].name, 'bazz');
	    assert.equal(res[1], 2);
	    done();
	});

    });
});
