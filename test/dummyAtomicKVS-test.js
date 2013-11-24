var DummyAtomicKVS = require('../dummyAtomicKVS.js');

describe('DummyAtomicKVS', function(){
    require('./atomicKeyValue-test.js')(new DummyAtomicKVS());
});
