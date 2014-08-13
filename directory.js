exports.init = function(ctx, args) {
    this.depth = args.depth || 0;
    this.dir = Object.create(null);
}
exports.put = function(ctx, patch, u) {
    var key = patch._path[this.depth];
    if(!u) {
	if(patch._path.length == this.depth + 1) {
	    if(key in this.dir) {
		ctx.conflict();
		return;
	    }
	    this.dir[key] = ctx.init(patch.content._type, patch.content);
	} else {
	    if(!(key in this.dir)) {
		this.dir[key] = ctx.init(this._type, {depth: this.depth + 1});
	    }
	    return exports._default.call(this, ctx, patch, u);
	}
    } else {
	if(patch._path.length == this.depth + 1) {
	    if(this.dir[key].$ !== ctx.init(patch.content._type, patch.content).$) {
		ctx.conflict();
		return;
	    }
	    delete this.dir[key];
	} else {
	    if(!(key in this.dir)) {
		ctx.conflict();
		return;
	    }
	    var res = exports._default.call(this, ctx, patch, u);
	    if(ctx.query(this.dir[key], {_type: 'count', _path: patch._path.slice(0, this.depth + 1)}) == 0) {
		delete this.dir[key];
	    }
	    return res;
	}
    }
}

exports._default = function(ctx, patch, u) {
    var key = patch._path[this.depth];
    if(!(key in this.dir)) {
	ctx.conflict();
	return;
    }
    if(u) patch = {_type: 'inv', patch: patch};
    var pair = ctx.transQuery(this.dir[key], patch);
    this.dir[key] = pair[0];
    return pair[1];
}

exports.count = function(ctx, patch, u) {
    if(patch._path.length > this.depth) {
	return exports._default.call(this, ctx, patch, u);
    }
    return Object.keys(this.dir).length;
}

exports._get_id = function(ctx, patch, u) {
    if(patch._path.length > this.depth + 1) {
	return exports._default.call(this, ctx, patch, u);
    }
    var key = patch._path[this.depth];
    return this.dir[key];
}