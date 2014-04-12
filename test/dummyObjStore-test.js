assert = require('assert');
ObjectDisp = require('../objectDisp.js');
DummyObjectStore = require('../dummyObjectStore.js');
var descObjectStore = require('./descObjectStore.js');

describe('DummyObjectStore', function(){
    descObjectStore(function(disp) {
	return new DummyObjectStore(disp);
    });
});
