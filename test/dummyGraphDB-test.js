var DummyGraphDB = require('../dummyGraphDB.js');

describe('DummyGraphDB', function(){
    require('./graphDB-test.js')(new DummyGraphDB());
});
