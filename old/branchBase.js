var util = require('./util.js');

module.exports = function(appBase, tipDB) {
    var self = this;
    this.newBranch = function(branchName, s0, cb) {
	util.seq([
	    function(_) { appBase.hash(s0, _.to('s0')); },
	    function(_) { tipDB.newKey(branchName, this.s0, cb); },
	], cb)();
    };
    this.query = function(branchName, patch, cb) {
	util.seq([
	    function(_) { tipDB.retrieve(branchName, _.to('tip')); },
	    function(_) { appBase.query(this.tip, patch, cb); },
	], cb)();
    };
    this.init = function(branchName, evaluator, args, cb) {
	util.seq([
	    function(_) { appBase.init(evaluator, args, _.to('s0')); },
	    function(_) { self.newBranch(branchName, this.s0, cb); },
	], cb)();
    };
    this.trans = function(branchName, patch, options, cb) {
	var retries = options.retries || 3;
	util.depend([
	    function(_) 
	    { tipDB.retrieve(branchName, _('tip')); },
	    function(_) 
	    { appBase.hash(patch, _('patchHash')); },
	    function(tip, patchHash, _) 
	    { tryModifyState(branchName, tip, patchHash, retries, options, _('origTip', 'newTip')); },
	    function(newTip, _) 
	    { cb(undefined, newTip); },
	], cb);
    };
    function tryModifyState(branchName, tip, patchHash, retries, options, cb) {
	if(retries == 0) {
	    return cb(new Error('Retries exhasted trying to modify state of branch ' + branchName));
	}
	util.depend([
	    function(_) 
	    { appBase.trans(tip, patchHash, options, _('desiredTip', 'conf')); },
	    function(conf, _) 
	    { if(conf && !options.strong) { 
		cb(new Error('Conflicting change in transition on branch ' + branchName)); 
	    } else {
		_('noConf')(undefined, true);
	    } },
	    function(noConf, desiredTip, _) 
	    { tipDB.modify(branchName, tip, desiredTip, _('newTip')); },
	    function(desiredTip, newTip, _) 
	    { if(desiredTip == newTip) {
		cb(undefined, tip, newTip); 
	    } else { 
		tryModifyState(branchName, newTip, patchHash, retries - 1, options, cb);
	    } },
	], cb);
    };
    this.fork = function(source, target, cb) {
	util.seq([
	    function(_) { tipDB.retrieve(source, _.to('srcTip')); },
	    function(_) { self.newBranch(target, this.srcTip, _); },
	], cb)();
    };

    this.tip = function(branch, cb) {
	tipDB.retrieve(branch, cb);
    };

    this.merge = function(destBranch, sourceBranch, options, cb) {
	util.depend([
	    function(_) 
	    { tipDB.retrieve(destBranch, _('dest')); },
	    function(_) 
	    { tipDB.retrieve(sourceBranch, _('source')); },
	    function(source, dest, _) 
	    { appBase.merge(dest, source, options, _('newState', 'conf', 'mergePatch')); },
	    function(mergePatch, _) 
	    { self.trans(destBranch, mergePatch, options, cb); },
	], cb);
    };

};