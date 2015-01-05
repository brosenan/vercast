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
    this.retrieve = function*(bucketName, tuid) {
	tuid = tuid || '';
	var bucket = buckets[bucketName] || [];
	return bucket
	    .filter(function(x) {return x.tuid > tuid})
	    .map(function(x) { return x.elem; });
    };
};