var util = require('./util.js');

exports.init = function(args, ctx) {
    ctx.ret({});
};

exports.apply = function(state, patch, unapply, ctx) {
    if(!patch._path) {
	throw new Error('Missing path in patch ' + patch._type + 
			(patch._at_path ? ' at path: ' + patch._at_path.join('/') : ''));
    }
    if(patch._path.length == 0) {
	console.log(state);
	throw new Error('Empty path in patch ' + patch._type + ' at path: ' + patch._at_path.join('/'));
    }
    var name = patch._path.shift();
    if(patch._path.length == 0) {
	var methodName = (unapply ? 'undo_' : 'do_') + patch._type;
	if(this[methodName]) {
	    return this[methodName](name, state, patch, ctx);
	}
    }
    if(!state[name]) {
	throw new Error('Invalid path: ' + name + 
			(patch._at_path ? ' at path: ' + patch._at_path.join('/') : ''));
    }
    if(!patch._at_path) {
	patch._at_path = [];
    }
    patch._at_path.push(name);
    util.seq([
	function(_) { ctx.apply(state[name], patch, unapply, _.to('child', 'res')); },
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
