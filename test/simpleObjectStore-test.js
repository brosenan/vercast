"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var describeObjectStore = require('./describeObjectStore');

function createOStore(dispMap) {
    var disp = new vercast.ObjectDispatcher(dispMap);
    var kvs = new vercast.DummyKeyValueStore();
    return new vercast.SimpleObjectStore(disp, kvs);
}

describe('SimpleObjectStore', function(){
    describeObjectStore(createOStore);
    describeObjectStore.describeCachedObjectStore(createOStore);
});
