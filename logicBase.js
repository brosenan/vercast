var util = require('./util.js');

exports.init = function(args, ctx) {
    ctx.ret({d: args.depth || 0});
}

exports.apply = require('./defaultEvaluator.js').apply;

exports.do_update = function(s, p, ctx) {
    if(!s.v && !s.c) {
	s.v = p.assert;
	ctx.ret(s);
    } else if(s.v) {
	s.c = {};
	var orig = s.v;
	delete s.v;
	util.seq([
	    function(_) { assertTerm(s, ctx, orig, _); },
	    function(_) { assertTerm(s, ctx, p.assert, _); },
	    function(_) { ctx.ret(s); },
	], ctx.err)();
    }
}

function indexOf(term, s) {
    if(s.d == 0) {
	return term[0] + '/' + (term.length - 1);
    } else {
	return term[s.d];
    }
}

function assertTerm(s, ctx, term, cb) {
    var index = indexOf(term, s);
    if(index in s.c) {
	util.seq([
	    function(_) { ctx.trans(s.c[index], {_type: 'update', assert: term}, _.to('afterUpdate')); },
	    function(_) { s.c[index] = this.afterUpdate; cb(); },
	], cb)();
    } else {
	util.seq([
	    function(_) { ctx.hash({_type: s._type, d: s.d + 1, v: term}, _.to('afterUpdate')); },
	    function(_) { s.c[index] = this.afterUpdate; cb(); },
	], cb)();
    }
}

exports.do_query = function(s, p, ctx) {
    if(s.v) {
	var bindings = [];
	var res = [];
	if(unify(p.query, s.v, bindings)) res.push(bindings);
	ctx.ret(s, res);
    } else {
	var index = indexOf(p.query, s);
	if(!s.c[index]) return ctx.ret(s, []);
	util.seq([
	    function(_) { ctx.trans(s.c[index], p, _.to('state', 'result')); },
	    function(_) { ctx.ret(s, this.result); },
	], ctx.err)();
    }
}

function unify(pattern, term, bindings) {
    if(typeof pattern == 'object' && 'v' in pattern) {
	bindings[pattern.v] = term;
	return true;
    } else if (typeof term == 'object' && 'v' in term) {
	bindings[term.v] = pattern;
	return true;
    } else if(Array.isArray(pattern)) {
	if(!Array.isArray(term)) return false;
	if(pattern.length != term.length) return false;
	if(pattern[0] != term[0]) return false;
	for(var i = 1; i < pattern.length; i++) {
	    if(!unify(pattern[i], term[i], bindings)) return false;
	}
	return true;
    } else {
	return pattern == term;
    }
}