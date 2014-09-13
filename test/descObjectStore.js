module.exports = function(createOstore) {
    var disp = new ObjectDisp({
	MyClass: {
	    init: function() { this.name = 'foo'; },
	    patch1: function (ctx, patch) {
		this._replaceWith = patch.rep;
	    },
	},
	Counter: require('../counter.js'),
	BinTree: require('../binTree.js'),
    });
    
    var ostore = createOstore(disp);
    describe('as ObjectStore', function(){
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
		var ostore = new createOstore(disp);
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
	    it('should replace the object if a _replaceWith field is added to the object', function(done){
		var ctx = {};
		var v = ostore.init(ctx, 'MyClass', {});
		var rep = ostore.init(ctx, 'Counter', {});
		v = ostore.trans(ctx, v, {_type: 'patch1', rep: rep})[0];
		v = ostore.trans(ctx, v, {_type: 'add', amount: 5})[0];
		var r = ostore.trans(ctx, v, {_type: 'get'})[1];
		assert.equal(r, 5);
		done();
	    });
	    it('should pass exceptions thrown by patch methods as the error field of the context', function(done){
		var disp = new ObjectDisp({
		    Class1: {
			init: function(ctx, args) {
			},
			emitError: function(ctx, patch) {
			    throw new Error('This is an error');
			},
		    }
		});
		var ostore = createOstore(disp);
		var v = ostore.init({}, 'Class1', {});
		var ctx = {};
		v = ostore.trans(ctx, v, {_type: 'emitError'})[1];
		assert.equal(ctx.error.message, 'This is an error');
		done();
	    });
	    it('should propagate exceptions thrown by underlying invocations', function(done){
		var disp = new ObjectDisp({
		    Child: {
			init: function(ctx, args) {
			},
			emitError: function(ctx, patch) {
			    throw new Error('This is an error');
			},
		    },
		    Parent: {
			init: function(ctx, args) {
			    this.foo = ctx.init('Child', args);
			},
			patch: function(ctx, p) {
			    this.foo = ctx.trans(this.foo, p.patch);
			},
		    },
		});
		var ostore = createOstore(disp);
		var v = ostore.init({}, 'Parent', {});
		var ctx = {};
		v = ostore.trans(ctx, v, {_type: 'patch', patch: {_type: 'emitError'}})[1];
		assert.equal(ctx.error.message, 'This is an error');
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
			    var pair = ctx.transQuery(this.counter, p.p)
			    this.counter = pair[0];
			    return pair[1];
			},
		    },
		    Counter: require('../counter.js'),
		});
		var ostore = createOstore(disp);
		var v = ostore.init({}, 'MyClass', {});
		v = ostore.trans({}, v, {_type: 'patchCounter', p: {_type: 'add', amount: 12}})[0];
		r = ostore.trans({}, v, {_type: 'patchCounter', p: {_type: 'get'}})[1];
		assert.equal(r, 12);
		done();
	    });
	    describe('.conflict()', function(){
		it('should set the context\'s confclit flag to true', function(done){
		    var disp = new ObjectDisp({
			Class2: {
			    init: function(ctx, args) {
				this.bar = args.val;
			    },
			    raiseConflict: function(ctx, p) {
				ctx.conflict();
			    },
			}
		    });
		    var ostore = new createOstore(disp);
		    var v = ostore.init({}, 'Class2', {val:2});
		    var ctx = {};
		    v = ostore.trans(ctx, v, {_type: 'raiseConflict'})[0];
		    assert(ctx.conf, 'Conflict flag should be true');
		    done();
		});
		it('should propagate conflicts to calling transitions', function(done){
		    var disp = new ObjectDisp({
			Class1: {
			    init: function(ctx, args) {
				this.foo = ctx.init('Class2', args);
			    },
			    patch: function(ctx, p) {
				this.foo = ctx.trans(this.foo, p.patch);
			    },
			    query: function(ctx, q) {
				return ctx.query(this.foo, q.query);
			    },
			},
			Class2: {
			    init: function(ctx, args) {
				this.bar = args.val;
			    },
			    raiseConflict: function(ctx, p) {
				ctx.conflict();
			    },
			}
		    });
		    var ostore = new createOstore(disp);
		    var v = ostore.init({}, 'Class1', {val:2});
		    var ctx = {};
		    v = ostore.trans(ctx, v, {_type: 'patch', patch: {_type: 'raiseConflict'}})[0];
		    assert(ctx.conf, 'Conflict flag should be true');
		    done();
		});
	    });
	    describe('.effect(patch)', function(){
		it('should add a patch to the effect set held by the context', function(done){
		    var disp = new ObjectDisp({
			Class1: {
			    init: function(ctx, args) {
			    },
			    addEffectPatch: function(ctx, patch) {
				ctx.effect(patch.patch);
			    },
			}
		    });
		    var ostore = createOstore(disp);
		    var v = ostore.init({}, 'Class1', {});
		    var ctx = {};
		    v = ostore.trans(ctx, v, {_type: 'addEffectPatch', patch: {_type: 'foo'}})[1];
		    assert(!ctx.error, 'No error should occur');
		    assert.deepEqual(ctx.eff, [{_type: 'foo'}]);
		    done();
		});
		describe('.self()', function(){
		    it('should return the ID of the object version that received the patch being applied', function(done){
			var disp = new ObjectDisp({
			    Class1: {
				init: function(ctx, args) {
				},
				foo: function(ctx, patch) {
				    return "bar";
				},
				fooSelf: function(ctx, patch) {
				    return ctx.query(ctx.self(), {_type: 'foo'});
				},
			    }
			});
			var ostore = createOstore(disp);
			var v = ostore.init({}, 'Class1', {});
			var ctx = {};
			var res = ostore.trans(ctx, v, {_type: 'fooSelf'})[1];
			assert.ifError(ctx.error);
			assert.equal(res, 'bar');
			done();
		    });
		});
	    });
	});
    });
    return ostore;
}