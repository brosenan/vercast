var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

describe('ObjectDispatcher', function(){
    describe('.init(type, args)', function(){
	it('should return an instance of the referenced type, after calling the init() function associated with the type', asyncgen.async(function*(){
	    var disp = new vercast.ObjectDispatcher({foo: {
		init: function*(ctx, args) {
		    this.bar = 2;
		    this.ctx = ctx;
		    this.baz = args.baz;
		}
	    }
						    });
	    var ctx = 777;
	    var obj = yield* disp.init(ctx, 'foo', {baz: 123});
	    assert.equal(obj._type, 'foo');
	    assert.equal(obj.bar, 2);
	    assert.equal(obj.ctx, ctx);
	    assert.equal(obj.baz, 123);
	}));
    });
    describe('.apply(ctx, obj, patch, unapply)', function(){
	it('should call a method corresponding to patch._type', asyncgen.async(function*(done){
	    var disp = new vercast.ObjectDispatcher({
		foo: {
		    init: function*(ctx, args) {},
		    bar: function*() {this.bar = 2;
				      return ctx + 1;},
		}
	    });
	    var ctx = 777;
	    var obj = yield* disp.init(ctx, 'foo');
	    var res = yield* disp.apply(ctx, obj, {_type: 'bar'});
	    assert.equal(obj.bar, 2);
	    assert.equal(res, 778);
	}));
	it('should call a patch handler function if one exists in the map', asyncgen.async(function*(){
	    var called = false;
	    var disp = new vercast.ObjectDispatcher({
		foo: {
		    init: function*() { this.value = 2; },
		},
		$bar: function*(ctx, p, u) {
		    called = true;
		    assert.equal(p.a, 3);
		    assert.equal(this.value, 2);
		},
	    });
	    var ctx = 777;
	    var foo = yield* disp.init(ctx, 'foo');
	    var res = yield* disp.apply(ctx, foo, {_type: 'bar', a:3});
	    assert(called, 'patch handler should have been called');
	}));
	it('should prefer the object method when both a method and a handler are defined', asyncgen.async(function*(){
	    var called = false;
	    var disp = new vercast.ObjectDispatcher({
		foo: {
		    init: function*() { this.value = 2; },
		    bar: function*() {
			called = true;
		    },
		},
		$bar: function*() {
		    assert(false, 'The handler should not have been called');
		},
	    });
	    var ctx = 777;
	    var foo = yield* disp.init(ctx, 'foo');
	    var res = yield* disp.apply(ctx, foo, {_type: 'bar', a:3});
	    assert(called, 'patch method should have been called');
	}));
    });
});
