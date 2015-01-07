"use strict";

var uuid = require('node-uuid');

module.exports = function() {
    var buckets = Object.create(null);
    this.clear = function*() {
	buckets = Object.create(null);
    };

    this.append = function*(bucketName, elems) {
	if(!bucketName || bucketName === '') {
	    throw Error("Invalid empty bucket name");
	}
	var tuid = uuid.v1();
	var bucket = buckets[bucketName];
	if(typeof bucket === 'undefined') {
	    bucket = [];
	    buckets[bucketName] = bucket;
	}
	elems.forEach(function(x) {
	    bucket.push({elem: x, tuid: tuid});
	});
	return tuid;
    };
    this.retrieve = function*(bucketName, tuid, giveTUID) {
	tuid = tuid || '';
	var bucket = buckets[bucketName] || [];
	var elems = bucket
	    .filter(function(x) {return x.tuid > tuid})
	    .map(function(x) { return x.elem; });
	if(giveTUID) {
	    var newTuid = bucket.length > 0 ? 
		bucket[bucket.length - 1].tuid :
		'';
	    return {elems: elems, tuid: newTuid};
	} else {
	    return elems;
	}
    };
};