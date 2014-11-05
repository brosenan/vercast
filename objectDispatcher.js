module.exports = function(dispMap) {
    this.init = function*(ctx, type, args) {
	var cls = dispMap[type];
	if(!cls) {
	    throw Error('Unsupported object type: ' + type);
	}

	var obj = {_type: type};
	if(!cls.init) {
	    throw Error('Function init() not defined for type: ' + type);
	}
	yield* cls.init.call(obj, ctx, args);
	return obj;
    };
    
    this.apply = function*(ctx, obj, patch, unapply) {
	var cls = dispMap[obj._type];
	var method = cls[patch._type];
	return yield* method.call(obj, patch, unapply);
    };
};

