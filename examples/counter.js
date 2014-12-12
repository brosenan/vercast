"use strict";

exports.init = function*() { this.value = 0; };
exports.add = function*(ctx, p, u) {
    this.value += (u?-1:1) * p.amount;
    return this.value;
};

exports.get = function*() {
    return this.value;
};
exports.put = function*(ctx, p, u) {
    return {_reapply: {
	_type: 'add',
	amount: p.value - this.value,
    }};
};