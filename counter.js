var defaultEvaluator = require('./defaultEvaluator.js');

exports.apply = defaultEvaluator.apply;
exports.unapply = defaultEvaluator.unapply;

exports.init= function(args, ctx) { 
    ctx.ret({val: 0}); 
};

exports.do_get = function(s, patch, ctx) {
    ctx.ret(s, s.val);
};
exports.do_add = function(s, patch, ctx) {
    s.val += patch.amount;
    ctx.ret(s);
};
exports.undo_add = function(s, patch, ctx) {
    s.val -= patch.amount;
    ctx.ret(s);
};
/*
exports.inv = function(patch) {
    var methodName = 'inv_' + patch.type;
    if(this[methodName]) {
	return this[methodName](patch);
    } else {
	return {};
    }
}
exports.inv_add = function(patch) {
    patch.amount *= -1;
    return patch;
}
*/