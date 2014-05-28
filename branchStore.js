var util = require('./util.js');

module.exports = function(stateStore, kvs) {
    var heads = {};

    this.init = function(className, args, cb) {
	stateStore.init(className, args, cb);
    }

    this.trans = function(v1, p, cb) {
	stateStore.trans(v1, p, cb);
    }

    this.fork = function(name, v0, cb) {
	heads[name] = v0;
	cb();
    }

    this.head = function(branchName) {
	return heads[branchName];
    }

    this.push = function(branchName, v2, cb) {
	util.seq([
	    function(_) { stateStore.merge(heads[branchName], v2, _.to('vm')); },
	    function(_) { heads[branchName] = this.vm; _(); },
	], cb)();
    }
}
