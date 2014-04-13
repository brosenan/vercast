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
    describe('.genID(bucketID, hash)', function(){
	it('should create a version ID based on a bucket ID (string) and a hash (string)', function(done){
	    var id = vercast.genID('bucket', 'hash');
	    assert.equal(id.$, 'bucket-hash');
	    done();
	});

    });

    describe('.bucketID(id)', function(){
	it('should return the bucket ID associated with the given version ID', function(done){
	    var id = vercast.genID('bucket', 'hash');
	    assert.equal(vercast.bucketID(id), 'bucket');
	    done();
	});
    });
    describe('.objID(id)', function(){
	it('should return the object hash part of the given version ID', function(done){
	    var id = vercast.genID('bucket', 'hash');
	    assert.equal(vercast.objID(id), 'hash');
	    done();
	});
    });

});
