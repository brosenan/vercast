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
	    function(_) { tryModifyState(branchName, this.tip, patch, retries, options, _.to('origTip', 'newTip')); },
	    function(_) { evalEnv.hash(this.origTip, _.to('s1')); },
	    function(_) { evalEnv.hash(this.newTip, _.to('s2')); },
	    function(_) { evalEnv.hash(patch, _.to('patch')); },
	    function(_) { graphDB.addEdge(this.s1.$hash$, this.patch.$hash$, this.s2.$hash$, _); },
	], cb)();
    };
    function tryModifyState(branchName, tip, patch, retries, options, cb) {
	if(retries == 0) {
	    return cb(new Error('Retries exhasted trying to modify state of branch ' + branchName));
	}
	util.seq([
	    function(_) { evalEnv.hash(patch, _.to('patch')); },
	    function(_) { evalEnv.trans(tip, this.patch, _.to('desiredTip', 'res', 'eff', 'conf')); },
	    function(_) { if(this.conf && !options.strong) { cb(new Error('Conflicting change in transition on branch ' + branchName)); }
			  else { _(); }},
	    function(_) { tipDB.modify(branchName, tip, this.desiredTip, _.to('newTip')); },
	    function(_) { if(this.desiredTip == this.newTip) { cb(undefined, tip, this.newTip); }
			  else { tryModifyState(branchName, this.newTip, this.patch, retries - 1, options, cb); }
			},
	], cb)();
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
	util.seq([
	    function(_) { tipDB.retrieve(dest, _.to('dest')); },
	    function(_) { tipDB.retrieve(source, _.to('source')); },
	    function(_) { evalEnv.hash(this.source, _.to('source')); },
	    function(_) { graphDB.findCommonAncestor(this.source.$hash$, this.dest.$hash$, _.to('ancestor', 'path1', 'path2')); },
	    function(_) { self.trans(dest, createPathPatch(this.path1, options), options, cb); },
	], cb)();
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