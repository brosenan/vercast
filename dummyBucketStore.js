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
	callback(undefined, this.buckets[id]);
    };
}
