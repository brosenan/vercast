module.exports = function() {
    var map = {};
    this.store = function(key, value, _) {
//	setTimeout(function() {
	    map[key] = value;
	    _();
//	}, 1);
    };
    this.retrieve = function(key, _) {
//	setTimeout(function() {
	    var value = map[key];
	    if(typeof value == 'undefined') {
		_(new Error('No match for key ' + key));
	    } else {
		_(undefined, value);
	    }
//	}, 1);
    };
    this.check = function(key, _) {
//	setTimeout(function() {
	    var value = map[key];
	    _(undefined, value);
//	}, 1);
    };
};