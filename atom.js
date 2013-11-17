exports.apply = require('./defaultEvaluator.js').apply;
exports.unapply = require('./defaultEvaluator.js').unapply;

exports.init = function(args, ctx) {
    ctx.ret({vals: [args.val]});
};

exports.do_set = function(state, p, ctx) {
    var index = -1;
    state.vals = state.vals.filter(function(val, i) {
	if(val == p.from) {
	    index = i;
	    return false
	} else {
	    return true;
	}
    });
    if(index < 0) ctx.conflict();
    state.vals.unshift(p.to);
    ctx.ret(state);
};
exports.undo_set = function(state, p, ctx) {
    var to = p.from;
    p.from = p.to;
    p.to = to;
    this.do_set(state, p, ctx);
};

exports.do_get = function(state, p, ctx) {
    ctx.ret(state, state.vals[0]);
};

exports.do_get_all = function(state, p, ctx) {
    ctx.ret(state, state.vals);
};

