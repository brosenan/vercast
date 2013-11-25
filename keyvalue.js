process._num_kv_reads = 0;
process._num_kv_writes = 0;
process._num_kv_bytes = 0;

module.exports = function() {
    var map = {};
    this.store = function(key, value, _) {
	map[key] = value;
	process._num_kv_writes++;
	process._num_kv_bytes += value.length;
	_();
    };
    this.retrieve = function(key, _) {
	var value = map[key];
	if(typeof value == 'undefined') {
	    _(new Error('No match for key ' + key));
	} else {
	    process._num_kv_reads++;
	    _(undefined, value);
	}
    };
    this.check = function(key, _) {
	var value = map[key];
	process._num_kv_reads++;
	_(undefined, value);
    };
};