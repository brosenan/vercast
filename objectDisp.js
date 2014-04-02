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
    this.apply = function(ctx, obj, patch, unapply) {
	if(!(patch._type in disp[obj._type])) {
	    throw new Error('Patch method ' + patch._type + ' is not defined in class ' + obj._type);
	}
	(disp[obj._type][patch._type])();
    }
};