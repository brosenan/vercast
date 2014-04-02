exports.init = function(ctx, args) {
    this.key = args.key;
    this.value = args.value;
    this.left = null;
    this.right = null;
}

exports.fetch = function(ctx, p, u) {
    if(p.key == this.key) {
	return this.value;
    } else if(p.key < this.key && this.left) {
	return ctx.query(this.left, p);
    } else if(this.right) {
	return ctx.query(this.right, p);
    }
};

exports.add = function(ctx, p, u) {
    if(u) {
	p._type = 'remove';
	return exports.remove.call(this, ctx, p, !u);
    }

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

exports.getMin = function(ctx, p, u) {
    if(this.left) return ctx.query(this.left, p);
    else return this;
}

exports.remove = function(ctx, p, u) {
    if(u) {
	p._type = 'add';
	return exports.add.call(this, ctx, p, !u);
    }
    if(p.key == this.key) {
	// Remove this node
	if(!this.left) this._replaceWith = this.right;
	else if(!this.right) this._replaceWith = this.left;
	else {
	    // Replace this node with its right-side min
	    var min = ctx.query(this.right, {_type: 'getMin'});
	    this.right  = ctx.trans(this.right, {_type: 'remove', key: min.key, value: min.value});
	    this.key = min.key;
	    this.value = min.value;
	}
    } else if(p.key < this.key) {
	this.left = ctx.trans(this.left, p);
    } else {
	this.right = ctx.trans(this.right, p);
    }
}
