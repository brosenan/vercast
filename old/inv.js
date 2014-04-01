var util = require('./util.js');

exports.apply = function(s1, patch, unapply, ctx) {
    util.seq([
	function(_) { ctx.apply(s1, patch.patch, !unapply, _.to('s2', 'res')); },
	function(_) { ctx.ret(this.s2, this.res); },
    ], ctx.err)();
};
