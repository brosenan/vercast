var crypto = require('crypto');

exports.hash = function(str) {
    var hash = crypto.createHash('sha256');
    hash.update(str);
    return hash.digest('base64');
}
