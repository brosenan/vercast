var util = require('./util.js');

module.exports = function(evalEnv, tipDB, graphDB) {
    var self = this;
    this.newBranch = function(branchName, s0, cb) {
	util.seq([
	    function(_) { evalEnv.hash(s0, _.to('s0')); },
	    function(_) { tipDB.newKey(branchName, this.s0, cb); },
	], cb)();
    };
    this.query = function(branchName, patch, cb) {
	util.seq([
	    function(_) { tipDB.retrieve(branchName, _.to('tip')); },
	    function(_) { evalEnv.query(this.tip, patch, cb); },
	], cb)();
    };
    this.init = function(branchName, evaluator, args, cb) {
	util.seq([
	    function(_) { evalEnv.init(evaluator, args, _.to('s0')); },
	    function(_) { self.newBranch(branchName, this.s0, cb); },
	], cb)();
    };
    this.trans = function(branchName, patch, options, cb) {
	var retries = options.retries || 3;
	util.seq([
	    function(_) { tipDB.retrieve(branchName, _.to('tip')); },
	    function(_) { tryModifyState(branchName, this.tip, patch, retries, _); },
	], cb)();
    };
    function tryModifyState(branchName, tip, patch, retries, cb) {
	if(retries == 0) {
	    return cb(new Error('Retries exhasted trying to modify state of branch ' + branchName));
	}
	util.seq([
	    function(_) { evalEnv.hash(patch, _.to('patch')); },
	    function(_) { evalEnv.trans(tip, this.patch, _.to('desiredTip', 'res', 'eff', 'conf')); },
	    function(_) { if(this.conf) { cb(new Error('Conflicting change in transition on branch ' + branchName)); }
			  else { _(); }},
	    function(_) { tipDB.modify(branchName, tip, this.desiredTip, _.to('newTip')); },
	    function(_) { if(this.desiredTip == this.newTip) { cb(); }
			  else { tryModifyState(branchName, this.newTip, this.patch, retries - 1, cb); }
			},
	], cb)();
    };
};