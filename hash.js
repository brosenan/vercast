var crypto = require('crypto');

module.exports = function() {

    var hashMap = {};

    this.hash = function(obj, _) {
	var sha1 = crypto.createHash('sha1');
	sha1.update(JSON.stringify(obj));
	var hash = sha1.digest('base64')
	hashMap[hash] = obj;
	_(undefined, {$hash$:hash});
    };

    this.unhash = function(hash, _) {
	_(undefined, hashMap[hash.$hash$]);
    };

}