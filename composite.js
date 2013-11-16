var util = require('./util.js');

exports.apply = function(s1, patch, ctx) {
    var self = this;
    if(patch.patches.length == 0) {
	return ctx.ret(s1, []);
    }
    var first = patch.patches.shift();
    util.seq([
	function(_) { ctx.trans(s1, first, _.to('s2', 'r1')); },
	function(_) { ctx.trans(this.s2, patch, _.to('s3', 'r2')); },
	function(_) { ctx.ret(this.s3, [this.r1].concat(this.r2)); },
    ], ctx.err)();
};
exports.unapply = function(s1, patch, ctx) {
    var unpatch = patch;
    unpatch.patches = patch.patches.reverse().map(function(p) { return {_type: 'inv', patch: p}; });
    return this.apply(s1, unpatch, ctx);
};
