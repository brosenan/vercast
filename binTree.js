exports.init = function(ctx, args) {
    this.key = args.key;
    this.value = args.value;
    this.left = null;
    this.right = null;
}

exports.fetch = function(ctx, p, u) {
    if(p.key == this.key) {
	return this.value;
    } else if(p.key < this.key) {
	if(this.left) {
	    return ctx.query(this.left, p);
	} else {
	    return;
	}
    } else {
	if(this.right) {
	    return ctx.query(this.right, p);
	} else {
	    return;
	}
    }
};

exports.add = function(ctx, p, u) {
    if(p.key == this.key) {
	ctx.conflict();
    } else if(p.key < this.key) {
	if(this.left) {
	    this.left = ctx.trans(this.left, p);
	} else {
	    this.left = ctx.init('BinTree', p);
	}
    } else {
	if(this.right) {
	    this.right = ctx.trans(this.right, p);
	} else {
	    this.right = ctx.init('BinTree', p);
	}
    }	    
};
