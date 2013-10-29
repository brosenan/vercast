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
	var q = [{n: node1, p: []}];
	while(q.length > 0 && q[0].n != node2) {
	    var n = q.shift();
	    for(var l in G[n.n].o) {
		q.push({n: G[n.n].o[l], p: n.p.concat([{l:l, d:true}])});
	    }
	    for(var l in G[n.n].i) {
		q.push({n: G[n.n].i[l], p: n.p.concat([{l:l, d:false}])});
	    }
	}
	if(q.length == 0) {
	    cb(new Error('Common ancestor not found'));
	} else {
	    var path = q[0].p;
	    var i = 0;
	    var n = node1;
	    while(!path[i].d) {
		n = G[n].i[path[i].l];
		i++;
	    }
	    cb(undefined, n);
	}
    };
};