var vercast = require('./vercast.js');

module.exports = function() {
    this.buckets = {};
    this.callCount = 0;
    this.locked = false;
    var tracer = new vercast.Tracer('bucketStore');
    
    this.add = function(id, value) {
	tracer.trace({add: id, value: value});
	if(!(id in this.buckets)) {
	    this.buckets[id] = [value];
	} else {
	    this.buckets[id].push(value);
	}
    };
    this.fetch = function(id, callback) {
	tracer.trace({fetch: id});
	if(this.locked) {
	    var err = new Error('Attempt to fetch while openning bucket ' + id);
	    err.bucketLocked = true;
	    throw err;
	}
	var self = this;
	this.callCount++;
	var bucket = this.buckets[id]
	if(!bucket) {
	    throw new Error('Bucket ' + id + ' not found');
	}
	setTimeout(function() {
	    self.locked = true;
	    for(var i = 0; i < bucket.length; i++) {
		callback(undefined, bucket[i], id);
	    }
	    self.locked = false;
	}, 0);
    };
    this.abolish = function() {
	this.buckets = {};
    };
    function createCallback(callback, item) {
	return function () {
	    callback(undefined, item);
	};
    }
}
