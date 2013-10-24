module.exports = function() {
    this.getInitialState = function() { return {val: 0}; }
    this.apply = function(s0, patch, _) {
	if(!patch.type) {
	    console.log(s0);
	    _(undefined, s0, undefined, true);
	    return;
	}
	var methodName = 'do_' + patch.type;
	if(this[methodName]) {
	    this[methodName](s0, patch, _);
	} else {
	    _(new Error('Unsupported patch: ' + patch.type));
	}
    }
    this.do_get = function(s, patch, _) {
	_(undefined, s, s.val, true);
    };
    this.do_add = function(s, patch, _) {
	s.val += patch.amount;
	_(undefined, s, undefined, true);
    };
    this.inv = function(patch) {
	var methodName = 'inv_' + patch.type;
	if(this[methodName]) {
	    return this[methodName](patch);
	} else {
	    return {};
	}
    }
    this.inv_add = function(patch) {
	patch.amount *= -1;
	return patch;
    }
}