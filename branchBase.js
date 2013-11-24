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
	util.seq([
	    function(_) { tipDB.retrieve(branchName, _.to('tip')); },
	    function(_) { evalEnv.trans(this.tip, patch, _.to('newTip')); },
	    function(_) { tipDB.modify(branchName, this.tip, this.newTip, _); },
	], cb)();

    };
};