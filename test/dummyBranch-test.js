var DummyBranch = require('../dummyBranch.js');

describe('DummyBranch', function(){
    require('./branch-test.js')(new DummyBranch());
});
