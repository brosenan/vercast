module.exports = function(ctx, obj, patch, unapply) {
    var patches = patch.patches;
    if(unapply) {
	patches = patches.map(function(x) { return {_type: 'inv', patch: x}; });
	patches.reverse();
    }
    for(var i = 0; i < patches.length; i++) {
	ctx.effect(patches[i]);
    }
}
