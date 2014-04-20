module.exports = function(ostore, sched) {
    var self = this;
    this.init = function(className, args, cb) {
	var ctx = {};
	var v0 = ostore.init(ctx, className, args);
	cb(ctx.error, v0);
    };
    this.transRaw = function(v1, p, cb) {
	var ctx = {};
	var pair = ostore.trans(ctx, v1, p);
	if(pair[0]) return cb(undefined, pair[0], pair[1]);
	sched.register(ctx.waitFor, function() {
	    self.transRaw(v1, p, cb);
	});
    };
}

