exports.init = function(args, ctx) {
    ctx.ret({val: args.val});
};
exports.apply = require('./defaultEvaluator.js').apply;
exports.unapply = require('./defaultEvaluator.js').unapply;

exports.do_set = function(state, p, ctx) {
    if(p.from != state.val) ctx.conflict();
    state.val = p.to;
    ctx.ret(state);
};

exports.do_get = function(state, p, ctx) {
    ctx.ret(state, state.val);
};