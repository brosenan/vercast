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
	    var pair = ctx.trans(this.left, p);
	    return pair[1];
	} else {
	    return;
	}
    } else {
	if(this.right) {
	    var pair = ctx.trans(this.right, p);
	    return pair[1];
	} else {
	    return;
	}
    }
};

exports.add = function(ctx, p, u) {
    if(p.key < this.key) {
	if(this.left) {
	    var pair = ctx.trans(this.left, p);
	    this.left = pair[0];
	    return pair[1];
	} else {
	    this.left = ctx.init('BinTree', p);
	}
    } else {
	if(this.right) {
	    var pair = ctx.trans(this.right, p);
	    this.right = pair[0];
	    return pair[1];
	} else {
	    this.right = ctx.init('BinTree', p);
	}
    }	    
};
