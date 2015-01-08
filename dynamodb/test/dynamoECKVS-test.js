"use strict";

var vercast = require('vercast');

var kvs = new vercast.DynamoDbEcKvs('TestKVS', 'us-east-1');

describe('DynamoDbEcKvs', function() {
    require('../../test/eventuallyConsistentKVS-test.js')(kvs);
});
