"use strict";
module.exports = function(obj) {
    var dirty = false;
    this.proxy = function() {
	var props = {};
	Object.keys(obj).forEach(function(key) {
	    props[key] = createProxyProperty(key);
	});
	var proxy = Object.create(null, props);
	proxy.__childProxies = {};
	return proxy;
    };
    this.isDirty = function() { 
	var nowDirty = dirty;
	dirty = false;
	return nowDirty;
    };

    function createProxyProperty(key) {
	return {
	    enumerable: true,
	    get: function() {
		var child = obj[key];
		if(child && typeof child === 'object') {
		    if(!this.__childProxies[key]) {
			this.__childProxies[key] = new MapProxy(child);
		    }
		    return this.__childProxies[key];
		} else {
		    return child;
		}
	    },
	    set: function(value) { 
		obj[key] = value; 
		dirty = true; 
	    },
	};
    }
    function MapProxy(obj) {
	this.__childProxies = {};
	this.get = function(key) {
	    var child = obj[key];
	    if(child && typeof child === 'object') {
		if(!this.__childProxies[key]) {
		    this.__childProxies[key] = new MapProxy(child);
		}
		return this.__childProxies[key];
	    } else {
		return child;
	    }
	};
	this.put = function(key, value) {
	    obj[key] = value;
	    dirty = true;
	}
	Object.freeze(this);
    }
}
