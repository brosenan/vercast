var vercast = require('./vercast.js');

module.exports = function(disp, cache, bucketStore) {
    this.hash = function(bucket, obj) {
	var json = JSON.stringify(obj);
	var objID = vercast.hash(json);
	var id = bucket + '-' + objID;
	cache.store(id, obj, json);
	return {$:id};
    };

    this.unhash = function(id) {
	var obj = cache.fetch(id.$);
	if(obj) return obj;
	
    };

    this.init = function() { return {$: 'foo'}; };
    this.trans = function () { return [10, 10]; };
}
