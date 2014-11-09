"use strict";
var assert = require('assert');

var asyncgen = require('asyncgen'); 
var vercast = require('vercast');

var describeObjectStore = require('./describeObjectStore');

describe('DummyObjectStore', function(){
    function createOStore(dispMap) {
	var disp = new vercast.ObjectDispatcher(dispMap);
	return new vercast.DummyObjectStore(disp);
    }
    describeObjectStore(createOStore);
});
