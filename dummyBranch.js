module.exports = function() {
    var tip;
    this.reset = function(root, cb) {
	tip = root;
	cb();
    };
    this.checkedUpdate = function(s1, s2, cb) {
	var oldTip = tip;
	tip = (s1 == oldTip) ? s2 : oldTip;
	cb(undefined, oldTip);
    };
    this.tip = function(cb) {
	cb(undefined, tip);
    };
};