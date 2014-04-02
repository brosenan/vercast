module.exports = function(disp) {
    this.init = function(ctx, className, args) {
	obj = disp.init(ctx, className, args);
	return {$: JSON.stringify(obj)};
    };
}
