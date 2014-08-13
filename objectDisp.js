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
	func = disp[obj._type][patch._type];
	if(func) {
	    res = func.call(obj, ctx, patch, unapply);
	} else {

	    var func = disp[':' + patch._type];
	    if(func) {
		res = func.call(this, ctx, obj, patch, unapply);
	    } else {
		func = disp[obj._type]._default;
		if(func) {
		    res = func.call(obj, ctx, patch, unapply);
		} else {
		    throw new Error('Patch method ' + patch._type + ' is not defined in class ' + obj._type);
		}
	    }
	}
	return [obj, res];
    }

};