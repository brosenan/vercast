"use strict";

exports.init = function*(ctx, args) {
    this.elementType = args.elementType;
    this.args = args.args;
    this.value = args.value || null;
    this.key = args.key || null;
    this.left = null;
    this.right = null;
};
exports._default = function*(ctx, p, u) {
    var res, field;
    var defaultValue = yield* ctx.init(this.elementType, this.args.clone());
    if(this.key === null) {
	this.key = p._key;
	this.value = defaultValue;
	field = 'value';
    } else if(this.key < p._key) {
	if(this.left === null) {
	    this.left = yield* ctx.init('array', {elementType: this.elementType,
						  args: this.args.clone(),
						  key: p._key,
						  value: defaultValue});
	}
	field = 'left';
    } else if(this.key > p._key) {
	if(this.right === null) {
	    this.right = yield* ctx.init('array', {elementType: this.elementType,
						   args: this.args.clone(),
						   key: p._key,
						   value: defaultValue});
	}
	field = 'right';
    } else { // ===
	field = 'value';
    }
    res = yield* ctx.trans(this[field], p, u);
    this[field] = res.v;
    return res.r;
};
exports.digest = function*(ctx, p, u) {
    var defaultValue = yield* ctx.init(this.elementType, this.args.clone());
    var digest = '';
    if(this.left !== null) {
	digest += (yield* ctx.trans(this.left, p, u)).r;
    }
    if(this.key !== null && this.value.$ !== defaultValue.$) {
	digest += this.key + '=>' + (yield* ctx.trans(this.value, p, u)).r + ';';
    }
    if(this.right !== null) {
	digest += (yield* ctx.trans(this.right, p, u)).r;
    }
};