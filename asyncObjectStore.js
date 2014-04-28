module.exports = function(ostore, sched) {
    var self = this;
    this.init = function(className, args, cb) {
	var ctx = {};
	var v0 = ostore.init(ctx, className, args);
	if(ctx.depend) {
	    sched.register(ctx.depend, function() {cb(ctx.error, v0);});
	} else {
	    cb(ctx.error, v0);
	}
    };
    this.transRaw = function(v1, p, cb) {
	var ctx = {};
	var pair = ostore.trans(ctx, v1, p);
	var waitFor = ctx.waitFor || [];
	var depend = ctx.depend || [];
	var all = waitFor.concat(depend);
	if(all.length == 0) {
	    cb(ctx.error, pair[0], pair[1], ctx.conf, ctx.eff);
	} else {
	    sched.register(all, function() {
		self.transRaw(v1, p, cb);
	    });
	}
    };
    this.trans = function(v1, ps, cb, _rs, _conf, _w) {
	_rs = _rs || [];
	_w = _w || 0;
	if(ps.length == 0) {
	    return cb(undefined, v1, _rs, _conf, _w);
	}
	this.transRaw(v1, ps[0], function(err, v2, r, conf, eff) {
	    eff = eff || [];
	    if(err) return cb(err);
	    self.trans(v2, ps.slice(1).concat(eff), cb, _rs.concat([r]), _conf || conf, _w + 1);
	});
    };
}
