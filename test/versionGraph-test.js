var util = require('../util.js');
var assert = require('assert');

module.exports = function(versionGraph) {
    beforeEach(function(done) {
	versionGraph.clear(done);
    });
    describe('as VersionGraph', function(){
	describe('addEdge', function(){
	    it('should accept an edge and add it to the graph', function(done){
		util.seq([
		    function(_) { versionGraph.addEdge("foo", "likes", "bar", _); },
		    function(_) { versionGraph.queryEdge("foo", "likes", _.to('shouldBeBar')); },
		    function(_) { assert.equal(this.shouldBeBar, 'bar'); _(); },
		], done)();
	    });
	    it('should create a dual mapping, mapping also the destination to the source', function(done){
		util.seq([
		    function(_) { versionGraph.addEdge("foo", "likes", "bar", _); },
		    function(_) { versionGraph.queryBackEdge("bar", "likes", _.to('shouldBeFoo')); },
		    function(_) { assert.equal(this.shouldBeFoo, 'foo'); _(); },
		], done)();
	    });

	});
    });
};