var util = require('./util.js');

module.exports = function(graphDB) {
    this.recordTrans = function (v1, p, w, v2, cb) {
	if(v1.$ != v2.$) {
	    graphDB.addEdge(v1.$, JSON.stringify({p: p, w: w}), v2.$, cb);
	} else {
	    cb();
	}
    }
    this.getMergeStrategy = function(v1, v2, resolve, cb) {
	util.seq([
	    function(_) { graphDB.findCommonAncestor(v1.$, v2.$, _.to('x', 'path1', 'path2')); },
	    function(_) { 
		var w1 = pathWeight(this.path1);
		var w2 = pathWeight(this.path2);
		var mergeInfo = {x: {$:this.x},
				 V1: v1,
				 V2: v2,
				 w1: w1,
				 w2: w2};
		if(w2 >= w1 && !resolve) {
		    var tmp = mergeInfo.V1;
		    mergeInfo.V1 = mergeInfo.V2;
		    mergeInfo.V2 = tmp;
		} else {
		    var tmp = mergeInfo.w1;
		    mergeInfo.w1 = mergeInfo.w2;
		    mergeInfo.w2 = tmp;
		}
		cb(undefined, mergeInfo.V1, mergeInfo.x, mergeInfo.V2, mergeInfo); 
	    },
	], cb)();
    };
    this.getPatches = function(v1, v2, cb) {
	getPatches([], [{_type: '_reapply', from: v1, to: v2}], cb);
    }
    this.recordMerge = function(mergeInfo, newV, p, pconf, cb) {
	var p1, p2;
	if(pconf.length == 0) {
	    p1 = JSON.stringify({p: {_type: '_reapply', 
				     from: mergeInfo.x, 
				     to: mergeInfo.V2},
				 w: mergeInfo.w1
				});
	    p2 = JSON.stringify({p: {_type: '_reapply', 
				     from: mergeInfo.x, 
				     to: mergeInfo.V1},
				 w: mergeInfo.w2
				});
	} else {
	    p1 = JSON.stringify({p: {_type: '_seq', patches: p},
				 w: mergeInfo.w1});
	    p2 = JSON.stringify({p: {_type: '_seq', patches: [{_type: '_reapply', 
							       from: mergeInfo.x, 
							       to: mergeInfo.V1},
							     ].concat(invertPatches(pconf))},
				 w: mergeInfo.w2});
	}
	util.seq([
	    function(_) { graphDB.addEdge(mergeInfo.V1.$, p1, newV.$, _); },
	    function(_) { graphDB.addEdge(mergeInfo.V2.$, p2, newV.$, _); },
	], cb)();

	function invertPatches(patches) {
	    var inv = patches.map(function(p) { return {_type: '_inv', patch: p}; });
	    return inv.reverse();
	}
    };

    function getPatches(prefix, list, cb) {
	while(list.length > 0 && list[0]._type != '_reapply') {
	    if(list[0]._type == '_seq') {
		list = list[0].patches.concat(list.slice(1));
	    } else {
		prefix.push(list.shift());
	    }
	}
	if(list.length == 0) return cb(undefined, prefix);
	var reapply = list.shift();
	util.seq([
	    function(_) { graphDB.findPath(reapply.from.$, reapply.to.$, _.to('path')); },
	    function(_) { getPatches(prefix, pathPatches(this.path).concat(list), cb); },
	], cb)();
    }
}

function pathWeight(path) {
    var s = 0;
    for(var i = 0; i < path.length; i++) {
	var entry = JSON.parse(path[i]);
	s += entry.w;
    }
    return s;
}

function pathPatches(path) {
    var patches = [];
    for(var i = 0; i < path.length; i++) {
	var item = JSON.parse(path[i]);
	patches.push(item.p);
    }
    return patches;
}
