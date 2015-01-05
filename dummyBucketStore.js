"use strict";
module.exports = function() {
    var buckets = Object.create(null);
    this.clear = function*() {
	buckets = Object.create(null);
    };

    this.append = function*(bucketName, elems) {
	if(!bucketName || bucketName === '') {
	    throw Error("Invalid empty bucket name");
	}
	var bucket = buckets[bucketName];
	if(typeof bucket === 'undefined') {
	    bucket = [];
	    buckets[bucketName] = bucket;
	}
	elems.forEach(function(x) {
	    bucket.push(x);
	});
    };
    this.retrieve = function*(bucketName) {
	return buckets[bucketName] || [];
    };
};