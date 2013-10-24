var crypto = require('crypto');

exports.hash = function(obj, _) {
    var sha1 = crypto.createHash('sha1');
    sha1.update(JSON.stringify(obj));
    _(undefined, sha1.digest('base64'));
}