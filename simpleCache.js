var Scheduler = require('./scheduler.js');

module.exports = function() {
    var sched = new Scheduler();
    this.objCache = {};
    this.jsonCache = {};
    this.store = function(id, obj, json) {
	this.objCache[id] = obj;
	this.jsonCache[id] = json || JSON.stringify(obj);
	sched.notify(id);
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
    this.waitFor = function(keys, cb) {
	for(var i = 0; i < keys.length; i++) {
	    if(this.jsonCache[keys[i]]) {
		throw new Error('Key ' + keys[i] + ' already in cache');
	    }
	}
	sched.register(keys, cb);
    }
}
