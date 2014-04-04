var crypto = require('crypto');

exports.hash = function(obj) {
    var hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(obj));
    return hash.digest('base64');
}
