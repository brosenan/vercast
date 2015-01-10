"use strict";
var vercast = require('vercast');

var kvs = new vercast.DummyKeyValueStore();

describe('DummyKeyValueStore', function(){
    require('./describeKeyValueStore.js')(kvs);
});
