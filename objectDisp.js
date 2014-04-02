module.exports = function(disp) {
    this.init = function(ctx, className, args) {
	if(!(className in disp)) {
	    throw new Error("Class " + className + " not defined");
	}
	var obj = {};
	disp[className].init.call(obj, ctx, args);
	obj._type = className;
	return obj;
    };
};