var util = require('./util.js');

module.exports = function(bucketStore, cache, sched) {
    var self = this;
    this.store = function(src, dest, patches, cb) {
	var wait = cache.store(src.$ + '->' + dest.$, JSON.stringify(patches));
	cb();
    }
    this.fetch = function(src, dest, cb) {
	var key = src.$ + '->' + dest.$;
	var list = cache.fetch(key);
	if(!list) throw new Error('Could not find edge: ' + key);
	list = JSON.parse(list);
	inflatePatches([], list, cb);
    }
    this.inflatePatches = function(list, cb) {
	inflatePatches([], list, cb);
    }

    function inflatePatches(prefix, list, cb) {
	if(list.length == 0) return cb(undefined, prefix);

	var item = list.shift();
	if(item._type == '_range') {
	    util.seq([
		function(_) { self.fetch(item.from, item.to, _.to('patches')); },
		function(_) { inflatePatches(prefix, this.patches.concat(list), cb); },
	    ], cb)();
	    return;
	} else {
	    prefix.push(item);
	    return inflatePatches(prefix, list, cb);
	}
    }
}
