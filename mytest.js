assert = require('assert');
ObjectDisp = require('./objectDisp.js');
BucketObjectStore = require('./bucketObjectStore.js');
DummyBucketStore = require('./dummyBucketStore.js');
SimpleCache = require('./simpleCache.js');

function run(SIZE) {

    var disp = new ObjectDisp({
	MyClass: {
	    init: function() { this.name = 'foo'; },
	    patch1: function (ctx, patch) {
		this._replaceWith = patch.rep;
	    },
	},
	Counter: require('./counter.js'),
	BinTree: require('./binTree.js'),
    });


    var cache = new SimpleCache();
    var bucketStore = new DummyBucketStore();

    var ostore = new BucketObjectStore(disp, cache, bucketStore);
    var v;
    var numbers = [];
    buildNumberList(numbers, 0, SIZE);
    //for(var i = 0; i < 1000; i++) numbers.push(i);
    var first = true;
    //while(numbers.length > 0) {
    for(var index = 0; index < numbers.length; index++) {
	//    var index = Math.floor(Math.random() * numbers.length);
	//var key = numbers.splice(index, 1)[0];
	var key = numbers[index];
	if(first) {
	    v = ostore.init({}, 'BinTree', {key: key, value: key * 2});
	    first = false;
	} else {
	    v = ostore.trans({}, v, {_type: 'add', key: key, value: key * 2})[0];
	}
    }
    cache.abolish();
    var ctx = {};
    var numToFetch = 7; //Math.floor(Math.random() * SIZE);
    var p = {_type: 'fetch', key: numToFetch};
    ostore.trans(ctx, v, p);
    cache.waitFor(ctx.waitFor, function() {
	var ctx = {};
	var res = ostore.trans(ctx, v, p)[1];
	assert.equal(res, numToFetch * 2);
	console.log('Done!');
    });


    function buildNumberList(numbers, first, max) {
	var middle = first + Math.floor((max - first)/2);
	numbers.push(middle);
	if(middle == first) return;
	buildNumberList(numbers, first, middle);
	buildNumberList(numbers, middle + 1, max);
    }
}

for(var i = 50; i <= 1000; i+=50) {
    var start = (new Date()).getTime();
    run(i);
    var end = (new Date()).getTime();
    console.log(i, end - start);
}
//run(1000);