var crypto = require('crypto');
var util = require('./util.js');

module.exports = function(kvs) {

    this.hash = function(obj, cb) {
	if(obj.$hash$) {
	    return cb(undefined, obj);
	}
	var sha1 = crypto.createHash('sha1');
	sha1.update(JSON.stringify(obj));
	var hash = sha1.digest('base64');
	util.seq([
	    function(_) { kvs.store(hash, JSON.stringify(obj), _); },
	    function(_) { cb(undefined, {$hash$:hash}); },
	], cb)();
    };

    this.unhash = function(hash, cb) {
	if(!hash.$hash$) {
	    return cb(undefined, hash);
	}
	util.seq([
	    function(_) { kvs.retrieve(hash.$hash$, _.to('json')); },
	    function(_) { cb(undefined, JSON.parse(this.json)); },
	], cb)();
	
    };

}