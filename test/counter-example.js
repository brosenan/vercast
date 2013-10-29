// Example application
exports.counter_app = convertApp({
    do_get: function(patch, ctx, _) {
	_(undefined, this.val, true);
    },
    do_add: function(patch, ctx, _) {
	// Side effect: count calls in the process
	if('_counter' in process) process._counter++;
	this.val += patch.amount;
	_(undefined, undefined, true);
    },
    do_set : function(patch, ctx, _) {
	var oldVal = this.val;
	this.val = patch.to;
	_(undefined, oldVal, oldVal == patch.from);
    },
    inv_add: function(patch) {
	patch.amount *= -1;
	return patch;
    },
    init: function(_) {
	this.val = 0;
	_();
    }
});

function convertApp(app) {
    var convApp = {};
    for(var key in app) {
	convApp[key] = app[key].toString();
    }
    return convApp;
}
