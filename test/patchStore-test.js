var util = require('../util.js');
var DummyBucketStore = require('../dummyBucketStore.js');
var SimpleCache = require('../simpleCache.js');
var Scheduler = require('../scheduler.js');
var PatchStore = require('../patchStore.js');

var sched = new Scheduler();
var bucketStore = new DummyBucketStore(sched);
bucketStore.async = true;
var cache = new SimpleCache(sched);
var patchStore = new PatchStore(bucketStore, cache, sched);

describe('PatchStore', function(){
    it('should store arrays of patches keyed by a source and target version IDs', function(done){
	util.seq([
	    function(_) { patchStore.store({$:'src'}, {$:'dest'}, [{_type: 'patch1'}, {_type: 'patch2'}], _); },
	    function(_) { patchStore.fetch({$:'src'}, {$:'dest'}, _.to('patches')); },
	    function(_) { assert.deepEqual(this.patches, [{_type: 'patch1'}, {_type: 'patch2'}]); _(); },
	], done)();
    });

    it('should treat patches of type _range by concatenating the underlying patches in place of the _range', function(done){
	util.seq([
	    function(_) { patchStore.store({$:'src1'}, {$:'dest1'}, [{_type: 'patch2'}, {_type: 'patch3'}], _); },
	    function(_) { patchStore.store({$:'src2'}, {$:'dest2'}, [{_type: 'patch1'}, 
								     {_type: '_range', from: {$:'src1'}, to: {$:'dest1'}},
								     {_type: 'patch4'}], _); },
	    function(_) { patchStore.fetch({$:'src2'}, {$:'dest2'}, _.to('patches')); },
	    function(_) { assert.deepEqual(this.patches, [{_type: 'patch1'},
							  {_type: 'patch2'},
							  {_type: 'patch3'},
							  {_type: 'patch4'}]); _(); },
	], done)();

    });

});
