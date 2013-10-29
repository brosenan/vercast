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
};