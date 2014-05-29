exports.init = function(ctx, args) {
    this.value = 0;
}

exports.add = function(ctx, patch, unapply) {
    var amount = patch.amount;
    if(unapply) amount = -amount;
    this.value += amount;
}

exports.get = function(ctx, patch) {
    return this.value;
}
