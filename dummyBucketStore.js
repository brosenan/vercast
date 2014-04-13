module.exports = function() {
    this.buckets = {};
    this.add = function(id, value) {
	if(!(id in this.buckets)) {
	    this.buckets[id] = [value];
	} else {
	    this.buckets[id].push(value);
	}
    };
    this.fetch = function(id, callback) {
	if(!(id in this.buckets)) {
	    throw new Error('Bucket ' + id + ' not found');
	}
	for(var i = 0; i < this.buckets[id].length; i++) {
	    var item = this.buckets[id][i];
	    setTimeout(createCallback(callback, item), 1);
	}
    };

    function createCallback(callback, item) {
	return function () {
	    callback(undefined, item);
	};
    }
}
