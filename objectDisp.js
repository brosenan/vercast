module.exports = function(disp) {
    this.init = function(ctx, className, args) {
	if(!(className in disp)) {
	    throw new Error("Class " + className + " not defined");
	}
	disp[className].init();
    };
};