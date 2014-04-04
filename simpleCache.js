module.exports = function() {
    this.objCache = {};
    this.jsonCache = {};
    this.store = function(id, obj, json) {
	this.objCache[id] = obj;
	this.jsonCache[id] = json || JSON.stringify(obj);
    };
    this.fetch = function(id) {
	var obj = this.objCache[id];
	if(obj) {
	    delete this.objCache[id];
	    return obj;
	} else {
	    var json = this.jsonCache[id];
	    if(json) {
		obj = JSON.parse(json);
		this.objCache[id] = obj;
		return obj;
	    }
	}
    };
    this.abolish = function() {
	this.objCache = {};
	this.jsonCache = {};
    };
}