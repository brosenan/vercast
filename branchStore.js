var util = require('./util.js');

module.exports = function(stateStore, kvs) {
    var self = this;
    var heads = {};

    this.init = function(className, args, cb) {
	stateStore.init(className, args, cb);
    }

    this.trans = function(v1, p, cb) {
	stateStore.trans(v1, p, cb);
    }

    this.fork = function(name, v0, cb) {
	heads[name] = v0;
	kvs.newKey(name, v0.$, cb);
    }

    this.head = function(branchName) {
	return heads[branchName];
    }

    this.push = function(branchName, v2, cb) {
	var head = heads[branchName]
	util.seq([
	    function(_) { stateStore.merge(head, v2, _.to('vm')); },
	    function(_) { kvs.modify(branchName, head.$, this.vm.$, _.to('newHead')); },
	    function(_) { heads[branchName] = {$:this.newHead};
			  if(this.newHead == this.vm.$) {
			      _();
			  } else {
			      self.push(branchName, v2, cb);
			  }},
	], cb)();
    }

    this.pull = function(v1, v2, cb) {
	if(typeof v2 == 'string') v2 = heads[v2];
	stateStore.merge(v2, v1, true, cb);
    }
}
