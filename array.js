exports.init = function(ctx, args) {
    this.arr = Array(args.size); // for now
    for(var i = 0; i < args.size; i++) {
	this.arr[i] = ctx.init(args.className, args.args);
    }
}
exports.get = function(ctx, patch, unapply) {
    return this.arr[patch.index];
}

exports.apply = function(ctx, patch, unapply) {
    var p = patch.patch;
    if(unapply) p = {_type: 'inv', patch: p};
    this.arr[patch.index] = ctx.trans(this.arr[patch.index], p);
}
