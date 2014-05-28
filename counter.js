exports.init = function(ctx, args) {
    this.value = 0;
}

exports.add = function(ctx, patch, unapply) {
    if(unapply) patch.amount = -patch.amount;
    this.value += patch.amount;
}

exports.get = function(ctx, patch) {
    return this.value;
}
