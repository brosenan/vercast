exports.apply = function(s0, patch, unapply, ctx) {
    if(!unapply) {
	var methodName = 'do_' + patch._type;
	if(this[methodName]) {
	    this[methodName](s0, patch, ctx);
	} else {
	    ctx.err(new Error('Unsupported patch: ' + patch._type));
	}
    } else {
	var methodName = 'undo_' + patch._type;
	if(this[methodName]) {
	    this[methodName](s0, patch, ctx);
	} else {
	    return this.apply(s0, patch, false, ctx);
	}
    }
}
