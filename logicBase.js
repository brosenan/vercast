exports.init = function(args, ctx) {
    ctx.ret({terms: [], d: args.depth || 0});
}

exports.apply = require('./defaultEvaluator.js').apply;

exports.do_update = function(s, p, ctx) {
    s.terms.push(p.assert);
    ctx.ret(s);
}

exports.do_query = function(s, p, ctx) {
    var res = [];
    for(var i = 0; i < s.terms.length; i++) {
	var match = [];
	if(unify(p.query, s.terms[i], match)) res.push(match);
    }
    ctx.ret(s, res);
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