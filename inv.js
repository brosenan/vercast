module.exports = function(ctx, obj, patch, unapply) {
    return this.apply(ctx, obj, patch.patch, !unapply)[1];
}
