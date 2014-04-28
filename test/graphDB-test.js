var util = require('../util.js');
var assert = require('assert');

module.exports = function(graphDB) {
    beforeEach(function(done) {
	graphDB.clear(done);
    });
    function isPrime(x) {
	for(var i = 2; i <= Math.sqrt(x); i++) {
	    if(x%i == 0) return false;
	}
	return true;
    }
    function createGraph(a, b, aMax, done) {
	while(a < aMax) {
	    while(b < a) {
		if(a%b == 0 && isPrime(a/b)) {
		    graphDB.addEdge(b, a/b, a, function(err) {
			if(err) done(err);
			createGraph(a, b+1, aMax, done);
		    });
		    return;
		}
		b++;
	    }
	    b = 1;
	    a++;
	}
	done();
    }
    describe('as GraphDB', function(){
	describe('addEdge', function(){
	    it('should accept an edge and add it to the graph', function(done){
		util.seq([
		    function(_) { graphDB.addEdge("foo", "likes", "bar", _); },
		    function(_) { graphDB.queryEdge("foo", "likes", _.to('shouldBeBar')); },
		    function(_) { assert.equal(this.shouldBeBar, 'bar'); _(); },
		], done)();
	    });
	    it('should create a dual mapping, mapping also the destination to the source', function(done){
		util.seq([
		    function(_) { graphDB.addEdge("foo", "likes", "bar", _); },
		    function(_) { graphDB.queryBackEdge("bar", "likes", _.to('shouldBeFoo')); },
		    function(_) { assert.equal(this.shouldBeFoo, 'foo'); _(); },
		], done)();
	    });
	});
	describe('findCommonAncestor', function(){
	    it('should find the common ancestor of two nodes, and the path to each of them', function(done){
		util.seq([
		    function(_) { graphDB.addEdge('terah', 'p1', 'abraham', _); },
		    function(_) { graphDB.addEdge('abraham', 'p2', 'isaac', _); },
		    function(_) { graphDB.addEdge('isaac', 'p3', 'jacob', _); },
		    function(_) { graphDB.addEdge('jacob', 'p4', 'joseph', _); },
		    function(_) { graphDB.addEdge('abraham', 'p5', 'ismael', _); },
		    function(_) { graphDB.addEdge('isaac', 'p6', 'esaw', _); },
		    function(_) { graphDB.addEdge('jacob', 'p7', 'simon', _); },
		    function(_) { graphDB.findCommonAncestor('simon', 'ismael', _.to('ancestor', 'path1', 'path2')); },
		    function(_) { assert.equal(this.ancestor, 'abraham'); _(); },
		], done)();
	    });
	    it('should handle the case where there are also common descendants', function(done){
		util.seq([
		    function(_) { createGraph(1, 1, 30, _); },
		    function(_) { graphDB.findCommonAncestor(4, 6, _.to('ancestor', 'p1', 'p2')); },
		    function(_) { assert.equal(this.ancestor, 2); _(); },
		], done)();
	    });
	    it('should return the path from the common ancestor to both nodes', function(done){
		util.seq([
		    function(_) { createGraph(1, 1, 30, _); },
		    function(_) { graphDB.findCommonAncestor(8, 10, _.to('ancestor', 'p1', 'p2')); },
		    function(_) { assert.equal(this.ancestor, 2); _(); },
		    function(_) { assert.deepEqual(this.p1, ['2', '2']); _(); },
		    function(_) { assert.deepEqual(this.p2, ['5']); _(); },
		], done)();
	    });

	});
    });
};