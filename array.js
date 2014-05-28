exports.init = function(ctx, args) {
    this.size = args.size;
    if(args.className) {
	this.initial = ctx.init(args.className, args.args);
    } else {
	this.initial = args.initial;
    }
    this.start = args.start || 0;
    this.b = args.b || 2;
    this.children = [];
    this.childSizes = [];
    var sizeLeft = this.size;
    var typicalSize = Math.ceil(this.size / this.b);
    while(sizeLeft > typicalSize) {
	this.children.push();
	this.childSizes.push(typicalSize);
	sizeLeft -= typicalSize;
    }
    this.children.push();
    this.childSizes.push(sizeLeft);
}
exports.get = function(ctx, patch, unapply) {
    var childIndex = Math.floor((patch.index - this.start) * this.b / this.size);
    if(this.childSizes[childIndex] == 1) {
	var child = this.children[patch.index - this.start];
	if(child) {
	    return child;
	} else {
	    return this.initial;
	}
    } else {
	if(this.children[childIndex]) {
	    return ctx.query(this.children[childIndex], patch);
	} else {
	    return this.initial;
	}
    }
}

exports.apply = function(ctx, patch, unapply) {
    var childIndex = Math.floor((patch.index - this.start) * this.b / this.size);
    if(this.childSizes[childIndex] == 1) {
	var p = patch.patch;
	if(unapply) p = {_type: 'inv', patch: p};
	if(!this.children[childIndex]) {
	    this.children[childIndex] = this.initial;
	}
	var pair = ctx.transQuery(this.children[childIndex], p);
	this.children[childIndex] = pair[0];
	return pair[1];
    } else {
	var patchToPropagate = patch;
	if(unapply) patchToPropagate = {_type: 'inv', patch: patch};
	if(!this.children[childIndex]) {
	    this.children[childIndex] = ctx.init(this._type, {size: this.childSizes[childIndex], 
							      b: this.b, 
							      initial: this.initial,
							      start: this.start + childIndex * this.childSizes[childIndex]});
	}
	var pair = ctx.transQuery(this.children[childIndex], patchToPropagate);
	this.children[childIndex] = pair[0];
	return pair[1];
    }
}

exports.digest = function(ctx, patch, unapply) {
    var str = '';
    var initialStr = ctx.query(this.initial, patch);
    for(var i = 0; i < this.b; i++) {
	if(this.children[i]) {
	    str += ctx.query(this.children[i], patch);
	} else {
	    for(var j = 0; j < this.childSizes[i]; j++) {
		str += initialStr;
	    }
	}
    }
    return str;
}

