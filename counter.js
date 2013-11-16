exports.init= function(args, ctx) { 
    ctx.ret({val: 0}); 
};

exports.apply = function(s0, patch, ctx) {
    var methodName = 'do_' + patch._type;
    if(this[methodName]) {
	this[methodName](s0, patch, ctx);
    } else {
	ctx.err(new Error('Unsupported patch: ' + patch._type));
    }
}

exports.unapply = function(s0, patch, ctx) {
    var methodName = 'undo_' + patch._type;
    if(this[methodName]) {
	this[methodName](s0, patch, ctx);
    } else {
	return this.apply(s0, patch, ctx);
    }
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
