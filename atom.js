exports.init = function(ctx, args) {
    this.value = args.value;
}
exports.get = function(ctx, p, u) {
    return this.value;
}
exports.change = function(ctx, p, u) {
    var precond = u ? p.to : p.from;
    if(JSON.stringify(this.value) !== JSON.stringify(precond)) {
	ctx.conflict();
    }
    this.value = u ? p.from : p.to;
}