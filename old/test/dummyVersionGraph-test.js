var DummyVersionGraph = require('../dummyVersionGraph.js');

describe('DummyVersionGraph', function(){
    require('./versionGraph-test.js')(new DummyVersionGraph());
});
