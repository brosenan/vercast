var util = require('./util.js');

module.exports = function(stateStore, versionGraph) {
    this.init = function(className, args, cb) {
	stateStore.init(className, args, cb);
    };
    this.trans = function(v1, p, simulate, cb) {
	if(typeof simulate == 'function') {
	    cb = simulate;
	    simulate = false;
	}
	util.seq([
	    function(_) { stateStore.trans(v1, [p], _.to('v2', 'r', 'c', 'w')); },
	    function(_) { if(!simulate) versionGraph.recordTrans(v1, p, this.w, this.v2, _);
			  else _();},
	    function(_) { cb(undefined, this.v2, this.r, this.c, this.w); },
	], cb)();
    };
    this.merge = function(v1, v2, resolve, cb) {
	if(typeof resolve == 'function') {
	    cb = resolve;
	    resolve = false;
	}
	util.seq([
	    function(_) { versionGraph.getMergeStrategy(v1, v2, resolve, _.to('V1', 'x', 'V2', 'info')); },
	    function(_) { versionGraph.getPatches(this.x, this.V2, _.to('patches')); },
	    function(_) { doTrans(this.V1, this.patches, resolve, _.to('vm', 'p', 'pconf')); },
	    function(_) { versionGraph.recordMerge(this.info, this.vm, this.p, this.pconf, _); },
	    function(_) { cb(undefined, this.vm, this.c); },
	], cb)();
    };

    function doTrans(v1, patches, allowConf, cb, _p, _pconf) {
	_p = _p || [];
	_pconf = _pconf || [];
	if(patches.length == 0) return cb(undefined, v1, _p, _pconf);
	
	util.seq([
	    function(_) { stateStore.trans(v1, [patches[0]], _.to('v2', 'r', 'conf', 'w')); },
	    function(_) { if(this.conf) {
		if(allowConf) {
		    doTrans(this.v2, patches.slice(1), allowConf, cb, _p, _pconf.concat([patches[0]]));
		} else {
		    var err = new Error('Merge Conflict');
		    err.conflict = {p: patches[0], v: v1};
		    cb(err);
		}
	    } else {
		doTrans(this.v2, patches.slice(1), allowConf, cb, _p.concat([patches[0]]), _pconf);
	    } },
	], cb)();
    }
}
