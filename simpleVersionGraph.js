var util = require('./util.js');

module.exports = function(graphDB) {
    this.recordTrans = function (v1, p, w, v2, cb) {
	graphDB.addEdge(v1.$, JSON.stringify({p: p, w: w}), v2.$, cb);
    }
    this.getMergeStrategy = function(v1, v2, cb) {
	util.seq([
	    function(_) { graphDB.findCommonAncestor(v1.$, v2.$, _.to('x', 'path1', 'path2')); },
	    function(_) { 
		var w1 = pathWeight(this.path1);
		var w2 = pathWeight(this.path2);
		if(w2 < w1) {
		    cb(undefined, v1, {$:this.x}, v2); 
		} else {
		    cb(undefined, v2, {$:this.x}, v1); 
		}
	    },
	], cb)();
    };
    this.getPatches = function(v1, v2, cb) {
	util.seq([
	    function(_) { graphDB.findPath(v1.$, v2.$, _.to('path')); },
	    function(_) { cb(undefined, pathPatches(this.path)); },
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