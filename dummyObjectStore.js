"use strict";
var events = require('events');

var vercast = require('vercast');


var DummyObjectStorage = function() {
    this.storeNewObject = function*(ctx, obj) {
	return JSON.stringify(obj);
    };
    this.retrieve = function*(ctx, v) {
	return new vercast.ObjectMonitor(JSON.parse(v));
    };
    this.storeVersion = function*(ctx, v1, p, monitor, r, eff) {
	return monitor.json();
    };
    this.checkCache = function*() {};
    this.deriveContext = function() {};
    this.recordTrans = function*() {};
};

module.exports = function(disp, effSeqFactory) {
    return new vercast.ObjectStore(disp, effSeqFactory, new DummyObjectStorage());
};
