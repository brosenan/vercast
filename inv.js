var util = require('./util.js');

exports.apply = function(s1, patch, ctx) {
    util.seq([
	function(_) { ctx.unapply(s1, patch.patch, _.to('s2', 'res')); },
	function(_) { ctx.ret(this.s2, this.res); },
    ], ctx.err)();
};
exports.unapply = function(s1, patch, ctx) {
    util.seq([
	function(_) { ctx.apply(s1, patch.patch, _.to('s2', 'res')); },
	function(_) { ctx.ret(this.s2, this.res); },
    ], ctx.err)();
};
