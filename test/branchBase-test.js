var assert = require('assert');
var util = require('../util.js');
var DummyAtomicKVS = require('../dummyAtomicKVS.js');
var DummyVersionGraph = require('../dummyVersionGraph.js');
var BranchBase = require('../branchBase.js');
var EvalEnv = require('../evalEnv.js');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

describe('BranchBase', function(){
    var tipDB = new DummyAtomicKVS();
    var graphDB = new DummyVersionGraph();
    var evaluators = {
	comp: require('../composite.js'),
	inv: require('../inv.js'),
	atom: require('../atom.js'),
	dir: require('../dir.js'),
	counter: require('../counter.js'),
    };
    var evalEnv = new EvalEnv(new HashDB(new DummyKVS()), new DummyKVS(), evaluators);
    var branchBase = new BranchBase(evalEnv, tipDB, graphDB);
    beforeEach(function(done) {
	util.seq([
	    function(_) { tipDB.clear(_); },
	    function(_) { graphDB.clear(_); },
	], done)();	
    });

    describe('.newBranch(branchName, s0, cb(err))', function(){
	it('should create a new branch with the given branchName, with the initial state s0', function(done){
	    util.seq([
		function(_) { evalEnv.init('atom', {val: 'bar'}, _.to('s0')); },
		function(_) { branchBase.newBranch('foo', this.s0, _);  },
		function(_) { branchBase.queryTip('foo', {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
	    ], done)();
	});
    });
});
