var EvalEnv = require('../evalEnv.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

describe('composite patch', function(){
    var hashDB;
    var kvs;
    beforeEach(function() {
	kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
    });
});
