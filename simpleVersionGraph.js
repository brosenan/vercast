"use strict";

module.exports = function(graphDB) {
    this.recordTrans = function*(v1, p, w, v2) {
	if(v1.$ != v2.$) {
	    yield* graphDB.addEdge(v1.$, JSON.stringify({p: p, w: w}), v2.$);
	}
    }
    this.getMergeStrategy = function*(v1, v2, resolve) {
	var res = yield* graphDB.findCommonAncestor(v1.$, v2.$);
	var w1 = pathWeight(res.p1);
	var w2 = pathWeight(res.p2);
	var pathToFollow, pathNotToFollow;
	var mergeInfo = {x: {$:res.node},
			 V1: v1,
			 V2: v2,
			 w1: w1,
			 w2: w2};
	if(w2 >= w1 && !resolve) {
	    var tmp = mergeInfo.V1;
	    mergeInfo.V1 = mergeInfo.V2;
	    mergeInfo.V2 = tmp;
	    //mergeInfo.pathToFollow = toPatches({$:res.node}, res.p1);
	    //mergeInfo.pathNotToFollow = toPatches({$:res.node}, res.p2);
	} else {
	    var tmp = mergeInfo.w1;
	    mergeInfo.w1 = mergeInfo.w2;
	    mergeInfo.w2 = tmp;
	    //mergeInfo.pathToFollow = toPatches({$:res.node}, res.p2);
	    //mergeInfo.pathNotToFollow = toPatches({$:res.node}, res.p1);
	}
	return mergeInfo;
    };
//    function toPatches(v0, path) {
//	var patches = [];
//	for(var i = 0; i < path.length; i++) {
//	    var next = {$: path[i].n};
//	    patches.push({_type: '_range', from: v0, to: next});
//	    v0 = next;
//	}
//	return patches;
//    }
//    this.getPatches = function*(v1, v2) {
//	return yield* getPatches([], [{_type: '_reapply', from: v1, to: v2}]);
//    }
    this.recordMerge = function*(mergeInfo, newV, p, pconf) {
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
	    p2 = JSON.stringify({p: {_type: '_seq', patches: invertPatches(pconf).concat([{_type: '_reapply', 
							       from: mergeInfo.x, 
							       to: mergeInfo.V1},
							     ])},
				 w: mergeInfo.w2});
	}
	yield* graphDB.addEdge(mergeInfo.V1.$, p1, newV.$);
	yield* graphDB.addEdge(mergeInfo.V2.$, p2, newV.$);

	function invertPatches(patches) {
	    var inv = patches.map(function(p) { return {_type: 'inv', patch: p}; });
	    return inv.reverse();
	}
    };

    function* getPatches(prefix, list) {
	while(list.length > 0 && list[0]._type != '_reapply') {
	    if(list[0]._type == '_seq') {
		list = list[0].patches.concat(list.slice(1));
	    } else {
		prefix.push(list.shift());
	    }
	}
	if(list.length == 0) return prefix;
	var reapply = list.shift();
	var path = yield* graphDB.findPath(reapply.from.$, reapply.to.$);
	return yield* getPatches(prefix, pathPatches(path).concat(list));
    }
}

function pathWeight(path) {
    var s = 0;
    for(var i = 0; i < path.length; i++) {
	var entry = JSON.parse(path[i].l);
	s += entry.w;
    }
    return s;
}

function pathPatches(path) {
    var patches = [];
    for(var i = 0; i < path.length; i++) {
	var item = JSON.parse(path[i].l);
	patches.push(item.p);
    }
    return patches;
}
