module.exports = function() {
    var map = {};
    this.store = function(key, value, _) {
	map[key] = value;
	_();
    };
    this.retrieve = function(key, _) {
	var value = map[key];
	if(typeof value == 'undefined') {
	    _(new Error('No match for key ' + key));
	} else {
	    _(undefined, value);
	}
    };
    this.check = function(key, _) {
	var value = map[key];
	_(undefined, value);
    };
};