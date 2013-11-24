exports.apply = require('./defaultEvaluator.js').apply;

exports.init = function(args, ctx) {
    ctx.ret({coll: {}});
};

exports.do_get = function(state, patch, ctx) {
    ctx.ret(state, state.coll);
};

exports.do_add = function(state, patch, ctx) {
    state.coll[patch.key] = patch.val;
    ctx.ret(state);
};