module.exports = function(ctx, obj, patch, unapply) {
    var patches = patch.patches;
    if(unapply) patches.reverse();
    for(var i = 0; i < patches.length; i++) {
	ctx.effect(patches[i]);
    }
}