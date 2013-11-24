var util = require('./util.js');

module.exports = function(evalEnv, tipDB, graphDB) {
    this.newBranch = function(branchName, s0, cb) {
	util.seq([
	    function(_) { evalEnv.hash(s0, _.to('s0')); },
	    function(_) { tipDB.newKey(branchName, this.s0, cb); },
	], cb)();
    };
    this.queryTip = function(branchName, patch, cb) {
	util.seq([
	    function(_) { tipDB.retrieve(branchName, _.to('tip')); },
	    function(_) { evalEnv.query(this.tip, patch, cb); },
	], cb)();
    };
};