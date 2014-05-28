module.exports = function() {
    var data = {};
    this.clear = function(cb) {
	data = {};
	cb(); 
    };
    this.newKey = function(key, val, cb) {
	if(key in data) {
	    return cb(new Error('Key ' + key + ' already exists'));
	}
	data[key] = val;
	cb();
    };
    this.retrieve = function(key, cb) {
	if(!(key in data)) {
	    return cb(new Error('Key ' + key + ' was not found'));
	}
	var value = data[key]
	setTimeout(function() { 
	    cb(undefined, value);
	}, 1);
    };
    this.modify = function(key, oldVal, newVal, cb) {
	if(data[key] != oldVal) {
	    return cb(undefined, data[key]);
	}
	data[key] = newVal;
	cb(undefined, newVal);
    };
    this.abolish = function() {
	data = {};
    }
};
