var util = require('./util.js');

module.exports = function(stateStore, versionGraph, patchStore) {
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
	    function(_) { 
		if(!simulate) patchStore.store(v1, this.v2, [p], _);
			  else _();},
	    function(_) { cb(undefined, this.v2, this.r[0], this.c, this.w); },
	], cb)();
    };
    this.merge = function(v1, v2, resolve, cb) {
	if(typeof resolve == 'function') {
	    cb = resolve;
	    resolve = false;
	}
	util.seq([
	    function(_) { versionGraph.getMergeStrategy(v1, v2, resolve, _.to('V1', 'x', 'V2', 'info', 'pathToFollow', 'pathNotToFollow')); },
	    function(_) { patchStore.inflatePatches(this.pathToFollow.concat([]), _.to('patches')); },
	    function(_) { doTrans(this.V1, this.patches, resolve, _.to('vm', 'p', 'pconf')); },
	    function(_) { versionGraph.recordMerge(this.info, this.vm, this.p, this.pconf, _); },
	    function(_) { recordMergeInPatchStore(this.info, this.vm, this.p, this.pconf, this.pathToFollow, this.pathNotToFollow, _); },
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
		    doTrans(v1, patches.slice(1), allowConf, cb, _p, _pconf.concat([patches[0]]));
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

    function recordMergeInPatchStore(mergeInfo, vm, p, pconf, pathToFollow, pathNotToFollow, cb) {
	var p1, p2;
	if(pconf.length == 0) {
	    p1 = pathToFollow;
	    p2 = pathNotToFollow;
	} else {
	    p1 = p;
	    p2 = invertPatches(pconf).concat(pathNotToFollow);
	}
	util.seq([
	    function(_) { if(!isTrivial(mergeInfo.V1, vm, p1)) patchStore.store(mergeInfo.V1, vm, p1, _);
			  else _(); },
	    function(_) { if(!isTrivial(mergeInfo.V2, vm, p2)) patchStore.store(mergeInfo.V2, vm, p2, _);
			  else _();},
	], cb)();
    }
    function invertPatches(patches) {
	var inv = patches.map(function(p) { return {_type: 'inv', patch: p}; });
	return inv.reverse();
    }
    function isTrivial(v1, v2, path) {
	if(path.length == 0) return true;
	else if(path.length == 1 &&
		path[0]._type == '_range' &&
		path[0].from.$ == v1.$ &&
		path[0].to.$ == v2.$) {
	    return true;
	} else return false;
    }
}
