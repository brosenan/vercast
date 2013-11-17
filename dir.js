var util = require('./util.js');

exports.init = function(args, ctx) {
    ctx.ret({});
};

exports.apply = function(state, patch, ctx) {
    var name = patch._path.shift();
    if(patch._path.length == 0) {
	var methodName = 'do_' + patch._type;
	if(this[methodName]) {
	    return this[methodName](name, state, patch, ctx);
	}
    }
    if(!state[name]) {
	throw new Error('Invalid path: ' + name);
    }
    util.seq([
	function(_) { ctx.apply(state[name], patch, _.to('child', 'res')); },
	function(_) { ctx.hash(this.child, _.to('child')); },
	function(_) { state[name] = this.child;
		      ctx.ret(state, this.res); },
    ], ctx.err)();
};

exports.unapply = function(state, patch, ctx) {
    var name = patch._path.shift();
    if(patch._path.length == 0) {
	var methodName = 'undo_' + patch._type;
	if(this[methodName]) {
	    return this[methodName](name, state, patch, ctx);
	}
    }
    if(!state[name]) {
	throw new Error('Invalid path: ' + name);
    }
    util.seq([
	function(_) { ctx.unapply(state[name], patch, _.to('child', 'res')); },
	function(_) { ctx.hash(this.child, _.to('child')); },
	function(_) { state[name] = this.child;
		      ctx.ret(state, this.res); },
    ], ctx.err)();
};

exports.do_create = function(name, state, patch, ctx) {
    util.seq([
	function(_) { ctx.init(patch.evalType, patch.args, _.to('child')); },
	function(_) { ctx.hash(this.child, _.to('child')); },
	function(_) { state[name] = this.child;
		      ctx.ret(state); },
    ], ctx.err)();
};

exports.undo_create = function(name, state, patch, ctx) {
    var self = this;
    util.seq([
	function(_) { ctx.init(patch.evalType, patch.args, _.to('childState')); },
	function(_) { patch.hash = this.childState;
		      self.do_delete(name, state, patch, ctx); },
    ], ctx.err)();
};

exports.do_delete = function(name, state, patch, ctx) {
    if(!state[name] || state[name].$hash$ != patch.hash.$hash$) ctx.conflict();
    delete state[name];
    ctx.ret(state);
};

exports.undo_delete = function(name, state, patch, ctx) {
    if(state[name]) ctx.conflict();
    state[name] = patch.hash;
    ctx.ret(state);
};

exports.do_get_hash = function(name, state, patch, ctx) {
    ctx.ret(state, state[name]);
};
