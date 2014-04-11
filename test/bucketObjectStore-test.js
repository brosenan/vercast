assert = require('assert');
ObjectDisp = require('../objectDisp.js');
BucketObjectStore = require('../bucketObjectStore.js');
DummyBucketStore = require('../dummyBucketStore.js');
SimpleCache = require('../simpleCache.js');

var descObjectStore = require('./descObjectStore.js');

var disp = new ObjectDisp({
    MyClass: {
	init: function() { this.name = 'foo'; },
	patch1: function (ctx, patch) {
	    this._replaceWith = patch.rep;
	},
    },
    Counter: require('../counter.js')
});
var cache = new SimpleCache();
var bucketStore = new DummyBucketStore();
var ostore = new BucketObjectStore(disp, cache, bucketStore);
describe.skip('BucketObjectStore', function(){
    descObjectStore(ostore);
});
