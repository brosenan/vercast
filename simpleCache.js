var Scheduler = require('./scheduler.js');
var vercast = require('./vercast.js');

module.exports = function(sched) {
    this.objCache = {};
    this.jsonCache = {};
    var tracer = new vercast.Tracer('cache');
    this.store = function(id, obj, json) {
	tracer.trace({store: [id, obj]});
	this.objCache[id] = obj;
	this.jsonCache[id] = json || JSON.stringify(obj);
	sched.notify(id);
    };
    this.fetch = function(id) {
	tracer.trace({fetch: id});
	var obj = this.objCache[id];
	if(obj) {
	    delete this.objCache[id];
	    tracer.trace('found obj');
	    return obj;
	} else {
	    var json = this.jsonCache[id];
	    if(json) {
		tracer.trace('found json');
		obj = JSON.parse(json);
		this.objCache[id] = obj;
		return obj;
	    } else {
		tracer.trace('not found');
	    }
	}
    };
    this.abolish = function() {
	this.objCache = {};
	this.jsonCache = {};
    };
    this.waitFor = function(keys, cb) {
	if(!keys) return cb();
	for(var i = 0; i < keys.length; i++) {
	    if(this.jsonCache[keys[i]]) {
		throw new Error('Key ' + keys[i] + ' already in cache');
	    }
	}
	sched.register(keys, cb);
    }
    this.check = function(key) {
	var found = this.jsonCache[key] ? true : false;
	tracer.trace({check: key, found: found});
	return found;
    };
}
