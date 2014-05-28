module.exports = function(stateStore, kvs) {
    var heads = {};

    this.init = function(className, args, cb) {
	stateStore.init(className, args, cb);
    }
    this.fork = function(name, v0, cb) {
	heads[name] = v0;
	cb();
    }

    this.head = function(branchName) {
	return heads[branchName];
    }
}
