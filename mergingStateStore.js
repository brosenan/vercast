var util = require('./util.js');

module.exports = function(stateStore, versionGraph) {
    this.init = function(className, args, cb) {
	stateStore.init(className, args, cb);
    };
    this.trans = function(v1, p, cb) {
	util.seq([
	    function(_) { stateStore.trans(v1, [p], _.to('v2', 'r', 'c', 'w')); },
	    function(_) { versionGraph.recordTrans(v1, p, this.w, this.v2, _); },
	    function(_) { cb(undefined, this.v2, this.r, this.c, this.w); },
	], cb)();
    };
    this.merge = function(v1, v2, cb) {
	util.seq([
	    function(_) { versionGraph.getMergeStrategy(v1, v2, _.to('V1', 'x', 'V2', 'info')); },
	    function(_) { versionGraph.getPatches(this.x, this.V2, _.to('patches')); },
	    function(_) { stateStore.trans(this.V1, this.patches, _.to('vm')); },
	    function(_) { versionGraph.recordMerge(this.info, this.vm, _); },
	    function(_) { cb(undefined, this.vm); },
	], cb)();
    };
}
