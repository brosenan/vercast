module.exports = function(disp) {
    this.init = function*(type, args) {
	var obj = yield* disp.init(undefined, type, args);
	return {$:JSON.stringify(obj)};
    };
    this.trans = function*(v, p, u) {
	var obj = JSON.parse(v.$);
	var r = yield* disp.apply(undefined, obj, p, u);
	return {r: r, v: {$:JSON.stringify(obj)}};
    };
};
