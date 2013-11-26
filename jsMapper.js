var util = require('./util.js');

exports.init = function(args, ctx) {
    ctx.ret(args);
};

exports.apply = function(state, patch, unapply, ctx) {
    util.depend([
	function(_) { ctx.unhash(state, _('mapper')); },
	function(_) { ctx.unhash(patch, _('patch')); },
	function(mapper, patch, _) {
	    var map = eval('(' + mapper.map + ')');
	    map(patch);
	    ctx.ret(state);
	},
    ], ctx.err);

};