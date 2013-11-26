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
	util.depend([
	    function(_) { tipDB.retrieve(branchName, _('tip')); },
	    function(tip, _) { tryModifyState(branchName, tip, patch, retries, options, _('origTip', 'newTip')); },
	    function(origTip, _) { evalEnv.hash(origTip, _('s1')); },
	    function(newTip, _) { evalEnv.hash(newTip, _('s2')); },
	    function(_) { evalEnv.hash(patch, _('patchHash')); },
	    function(s1, s2, patchHash, _) { graphDB.addEdge(s1.$hash$, patchHash.$hash$, s2.$hash$, _('done')); },
	    function(newTip, done, _) { cb(undefined, newTip); },
	], cb);
    };
    function tryModifyState(branchName, tip, patch, retries, options, cb) {
	if(retries == 0) {
	    return cb(new Error('Retries exhasted trying to modify state of branch ' + branchName));
	}
	util.depend([
	    function(_) { evalEnv.hash(patch, _('patchHash')); },
	    function(patchHash, _) { evalEnv.trans(tip, patchHash, _('desiredTip', 'res', 'eff', 'conf')); },
	    function(conf, _) { if(conf && !options.strong) { 
		cb(new Error('Conflicting change in transition on branch ' + branchName)); 
	    } else {
		_('noConf')(undefined, true);
	    } },
	    function(noConf, desiredTip, _) { tipDB.modify(branchName, tip, desiredTip, _('newTip')); },
	    function(desiredTip, newTip, patchHash, _) { if(desiredTip == newTip) { cb(undefined, tip, newTip); }
			  else { tryModifyState(branchName, newTip, patchHash, retries - 1, options, cb); }
			},
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

    this.merge = function(dest, source, options, cb) {
	util.depend([
	    function(_) 
	    { tipDB.retrieve(dest, _('dest')); },
	    function(dest, _) 
	    { evalEnv.hash(dest, _('destHash')); },
	    function(_) 
	    { tipDB.retrieve(source, _('source')); },
	    function(source, _) 
	    { evalEnv.hash(source, _('sourceHash')); },
	    function(sourceHash, destHash, _) 
	    { graphDB.findCommonAncestor(sourceHash.$hash$, destHash.$hash$, _('ancestor', 'path1', 'path2')); },
	    function(path1, _) 
	    { self.trans(dest, createPathPatch(path1, options), options, _('newTip')); },
	    function(path2, _) 
	    { evalEnv.hash(createPathPatch(path2, options), _('path2Hashed')); },
	    function(path2Hashed, newTip, sourceHash, _) 
	    { graphDB.addEdge(sourceHash.$hash$, path2Hashed.$hash$, newTip.$hash$, cb); },
	], cb);
    };

    function createPathPatch(path, options) {
	return {_type: 'comp',
		weak: options.weak,
		patches: path.map(function(x) {
		    return {$hash$: x};
		}),
	       };
    }
};