exports.init = function() {
    this.dir = Object.create(null);
}
exports.put = function(ctx, patch, u) {
    var key = patch._path[0];
    if(!u) {
	if(key in this.dir) {
	    ctx.conflict();
	    return;
	}
	this.dir[key] = ctx.init(patch.content._type, patch.content);
    } else {
	if(this.dir[key].$ !== ctx.init(patch.content._type, patch.content).$) {
	    ctx.conflict();
	    return;
	}
	delete this.dir[key];
    }
}
