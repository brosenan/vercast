var vercast = require('./vercast.js');

module.exports = function(sched) {
    var self = this;
    this.buckets = {};
    this.callCount = 0;
    this.locked = false;
    var tracer = new vercast.Tracer('bucketStore');
    
    this.add = function(bucket, item) {
	if(!this.async) {
	    add(bucket, item);
	}
	var id = Math.floor(Math.random() * 1000000000);
	setTimeout(function() {
	    if(self.async) {
		add(bucket, item);
	    }
	    sched.notify(id);
	}, 0);
	return id;
    };
    this.fetch = function(id, callback) {
	tracer.trace({fetch: id});
	/*if(this.locked) {
	    var err = new Error('Attempt to fetch while openning bucket ' + id);
	    err.bucketLocked = true;
	    console.log(23);
	    throw err;
	}*/
	var self = this;
	this.callCount++;
	var bucket = this.buckets[id]
	if(!bucket) {
	    return callback(new Error('Bucket ' + id + ' not found'));
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
    function add(bucket, item) {
	tracer.trace({add: bucket, value: item});
	if(!(bucket in self.buckets)) {
	    self.buckets[bucket] = [item];
	} else {
	    self.buckets[bucket].push(item);
	}
    }
}
