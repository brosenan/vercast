var assert = require('assert');
var vercast = require('../vercast.js');
var crypto = require('crypto');

describe('vercast', function(){
    describe('.hash(obj)', function(){
	it('should return a SHA-256 digest of the object\'s content', function(done){
	    var obj = {foo: 'bar', key: 'tree', value: 12.3};
	    var objHash = vercast.hash(obj);
	    
	    var hash = crypto.createHash('sha256');
	    hash.update(JSON.stringify(obj));
	    assert.equal(objHash, hash.digest('base64'));
	    done();
	});

    });

});
