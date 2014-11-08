module.exports = function(obj) {
    var dirty = false;
    this.proxy = function() {
	var props = {};
	Object.keys(obj).forEach(function(key) {
	    props[key] = createProxyProperty(key);
	});
	return Object.create(null, props);
    };
    this.isDirty = function() { 
	var nowDirty = dirty;
	dirty = false;
	return nowDirty;
    };

    function createProxyProperty(key) {
	return {
	    enumerable: true,
	    get: function() { return obj[key]; },
	    set: function(value) { 
		obj[key] = value; 
		dirty = true; 
	    },
	};
    }
}
