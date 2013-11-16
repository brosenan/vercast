exports.init = function(args, ctx) {
    ctx.ret({val: args.val});
};
exports.apply = require('./defaultEvaluator.js').apply;
exports.unapply = require('./defaultEvaluator.js').unapply;

exports.do_set = function(state, p, ctx) {
    state.val = p.to;
    ctx.ret(state);
};