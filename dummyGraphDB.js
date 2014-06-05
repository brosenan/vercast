var util = require('./util.js');

module.exports = function() {
    var G = {};
    this.clear = function(cb) {
	G = {};
	cb();
    };
    
    function mapEdge(src, label, dest, dir) {
	var v = G[src];
	if(!v) {
	    v = {i: {}, o: {}};
	    G[src] = v;
	}
	if(dir) {
	    v.o[label] = dest;
	} else {
	    v.i[label] = dest;
	}
    }

    this.addEdge = function(src, label, dest, cb) { 
	//console.log(src, '--', label, '->', dest);
	mapEdge(src, label, dest, true);
	mapEdge(dest, label, src, false);
	cb();
    };
    this.queryEdge = function(src, label, cb) {
	cb(undefined, G[src].o[label]);
    };
    this.queryBackEdge = function(dest, label, cb) {
	cb(undefined, G[dest].i[label]);
    };
    this.findCommonAncestor = function(node1, node2, cb) {
	var res = this.bfs(node1, function(node, path) {
	    var res = {};
	    var i = 0;
	    while(i < path.length && !path[i].d) i++;
	    while(i < path.length && path[i].d) i++;
	    if(i < path.length) res.prune = true;
	    else if(node == node2) {
		res.include = true;
		res.done = true;
	    }
	    return res;
	});
	if(res.length > 0) {
	    var node = node1;
	    var path = res[0].p;
	    var i = 0;
	    var p1 = [];
	    while(i < path.length && !path[i].d) {
		p1.unshift({l: path[i].l, n: node});
		node = G[node].i[path[i].l];
		i++;
	    }
	    var p2 = [];
	    while(i < path.length) {
		p2.push({l: path[i].l, n: path[i].n});
		i++;
	    }
	    cb(undefined, node, p1, p2);
	} else {
	    cb(new Error('No path found from ' + node1 + ' to ' + node2));
	}
    };
    this.print = function() { console.log(G); };
    this.bfs = function(start, eval) {
	var results = [];
	var q = [{n: start, p: []}];
	while(q.length > 0) {
	    var curr = q.shift();
	    var res = eval(curr.n, curr.p);
	    if(res.include) results.push(curr);
	    if(res.prune) continue;
	    if(res.done) break;
	    for(var l in G[curr.n].o) {
		q.push({n: G[curr.n].o[l], p: curr.p.concat([{l:l, n:G[curr.n].o[l], d:true}])});
	    }
	    for(var l in G[curr.n].i) {
		q.push({n: G[curr.n].i[l], p: curr.p.concat([{l:l, n:G[curr.n].i[l], d:false}])});
	    }
	}
	return results;
    };
    this.findPath = function(x, y, cb) {
	var self = this;
	util.seq([
	    function(_) { setTimeout(_, 0); },
	    function(_) {
		this.res = self.bfs(x, function(node, path) {
		    var res = {};
		    var i = 0;
		    // Go forwards only
		    while(i < path.length && path[i].d) i++;
		    if(i < path.length) res.prune = true;
		    else if(node == y) {
			res.include = true;
			res.done = true;
		    }
		    return res;
		});
		_();
	    },
	    function(_) { if(this.res.length > 0) cb(undefined, pathLabels(this.res[0].p));
			  else cb(new Error('Could not find path from ' + x + ' to ' + y)); },
	], cb)();

    };
    this.abolish = function() {
	G = {};
    }
    this.dump = function() {
	console.log(G);
    }
};

function pathLabels(path) {
    var labels = [];
    for(var i = 0; i < path.length; i++) {
	labels.push(path[i].l);
    }
    return labels;
}
