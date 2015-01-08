"use strict";

var vercast = require('vercast');

var kvs = new vercast.DummyECKVS();

describe('DummyECKVS', function() {
    require('./eventuallyConsistentKVS-test.js')(kvs);
});
