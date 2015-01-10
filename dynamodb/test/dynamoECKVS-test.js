"use strict";

var vercast = require('vercast');

var kvs = new vercast.DynamoKVS('TestKVS', 'us-east-1');

describe('DynamoKVS', function() {
    require('../../test/eventuallyConsistentKVS-test.js')(kvs);
    require('../../test/atomicKeyValue-test.js')(kvs);
    require('../../test/describeKeyValueStore.js')(kvs);
});
