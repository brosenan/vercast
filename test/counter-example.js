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
    inv_add: function(patch) {
	patch.amount *= -1;
	return patch;
    },
    init: function() {
	this.val = 0;
    }
});

function convertApp(app) {
    var convApp = {};
    for(var key in app) {
	convApp[key] = app[key].toString();
    }
    return convApp;
}
