var util = require('./util.js');

module.exports = function(stateStore, kvs) {
    var self = this;
    var heads = {};

    this.init = function(className, args, cb) {
	stateStore.init(className, args, cb);
    }

    this.trans = function(v1, p, cb) {
	var transaction;
	if(v1.curr) {
	    transaction = v1;
	    v1 = v1.curr;
	}
	if(transaction) {
	    transaction.patches.push(p);
	}
	util.seq([
	    function(_) { stateStore.trans(v1, p, transaction ? true : false, _.to('v2', 'r', 'c')); },
	    function(_) { if(this.v2.$ === v1.$ && typeof this.r === 'object' && this.r._ping) self.trans(v1, this.r._ping, cb);
			  else _(); },
	    function(_) { if(transaction) transaction.curr = this.v2;
			  cb(undefined, this.v2, this.r, this.c); },
	], cb)();
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
    this.beginTransaction = function(v0) {
	return {baseline: v0, curr: v0, patches: []};
    }
    this.commit = function(trans, cb) {
	var transPatch = {_type: 'transaction', patches: trans.patches};
	stateStore.trans(trans.baseline, transPatch, cb);
    }
}
