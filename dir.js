var util = require('./util.js');

exports.init = function(args, ctx) {
    ctx.ret({v:{}, m:{}});
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
    if(!state.v[name]) {
	throw new Error('Invalid path: ' + name + 
			(patch._at_path ? ' at path: ' + patch._at_path.join('/') : ''));
    }
    if(!patch._at_path) {
	patch._at_path = [];
    }
    patch._at_path.push(name);
    if(unapply) {
	patch = {_type: 'inv', patch: patch};
    }
    util.depend([
	function(_) { 
	    ctx.trans(state.v[name], patch, _('child', 'res')); },
	function(child, _) { 
	    ctx.hash(child, _('childHash')); },
	function(_) { applyMappings(state.m[name], patch, ctx, _('doneMapping')); },
	function(childHash, res, doneMapping, _) { 
	    state.v[name] = childHash;
	    ctx.ret(state, res); },
    ], ctx.err);
};

function applyMappings(mappings, patch, ctx, cb) {
    if(!mappings || mappings.length == 0) return cb();
    util.depend([
	function(_) { ctx.trans(mappings[0], patch, _('doneFirst')); },
	function(_) { applyMappings(mappings.slice(1), patch, ctx, _('doneRest')); },
	function(doneFirst, doneRest, _) { cb(); },
    ], cb);

}

exports.do_create = function(name, state, patch, ctx) {
    util.seq([
	function(_) { ctx.init(patch.evalType, patch.args, _.to('child')); },
	function(_) { ctx.hash(this.child, _.to('child')); },
	function(_) { state.v[name] = this.child;
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
    if(!state.v[name] || state.v[name].$hash$ != patch.hash.$hash$) ctx.conflict();
    delete state.v[name];
    ctx.ret(state);
};

exports.undo_delete = function(name, state, patch, ctx) {
    if(state.v[name]) ctx.conflict();
    state.v[name] = patch.hash;
    ctx.ret(state);
};

exports.do_get_hash = function(name, state, patch, ctx) {
    ctx.ret(state, state.v[name]);
};

exports.do_add_mapping = function(name, state, patch, ctx) {
    if(!state.m[name]) state.m[name] = []
    state.m[name].push(patch.mapper);
    ctx.ret(state);
};