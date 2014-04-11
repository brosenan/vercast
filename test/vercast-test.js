var assert = require('assert');
var vercast = require('../vercast.js');
var crypto = require('crypto');

describe('vercast', function(){
    describe('.hash(obj)', function(){
	it('should return a SHA-256 digest of the given string', function(done){
	    var str = 'hello, there';
	    var strHash = vercast.hash(str);
	    
	    var hash = crypto.createHash('sha256');
	    hash.update(str);
	    assert.equal(strHash, hash.digest('base64'));
	    done();
	});

    });

});
