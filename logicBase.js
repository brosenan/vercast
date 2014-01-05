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
	util.depend([
	    function(_) { ctx.hash({_type: s._type,
				    d: s.d + 1,
				    v: p.assert}, _('first')); },
	    function(_) { ctx.hash({_type: s._type,
				    d: s.d + 1,
				    v: s.v}, _('second')); },
	    function(first, second, _) { s.c = {};
					 s.c[indexOf(p.assert[0], s)] = first;
					 s.c[indexOf(s.v, s)] =  second;
					 delete s.v;
					 ctx.ret(s);},
	], ctx.err);
    }
}

function indexOf(term, s) {
    return term[0];
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