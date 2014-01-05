var util = require('./util.js');

exports.init = function(args, ctx) {
    ctx.ret({d: args.depth || 0});
}

exports.apply = require('./defaultEvaluator.js').apply;

exports.do_update = function(s, p, ctx) {
    if(!s.v && !s.c) {
	s.v = p.assert;
	ctx.ret(s);
    } else {
	var toIndex = [p.assert];
	if(s.v) {
	    toIndex.push(s.v);
	    delete s.v;
	}
	if(!s.c) {
	    s.c = {};
	}
	util.seq([
	    function(_) { createChildren(s, ctx, toIndex, _.to('children')); },
	    function(_) { s.c = this.children; ctx.ret(s); },
	], ctx.err)();

    }
}

function createChildren(s, ctx, toIndex, cb) {
    if(toIndex.length == 0) {
	return cb(undefined, s.c);
    }
    var first = toIndex[0];
    var child = {_type: 'logicBase', d: s.d + 1, v: first};
    util.seq([
	function(_) { ctx.hash(child, _.to('h')); },
	function(_) { s.c[first[0]] = this.h;
		      createChildren(s, ctx, toIndex.slice(1), cb); },
    ], ctx.err)();
}

exports.do_query = function(s, p, ctx) {
    var res = [];
    if(s.v) {
	var bindings = [];
	if(unify(p.query, s.v, bindings)) {
	    res.push(bindings);
	}
	return ctx.ret(s, res);
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