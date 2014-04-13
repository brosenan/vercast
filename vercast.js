var crypto = require('crypto');

exports.hash = function(str) {
    var hash = crypto.createHash('sha256');
    hash.update(str);
    return hash.digest('base64');
}

exports.genID = function(bucketID, hash) {
    return {$: bucketID + '-' + hash};
};

exports.bucketID = function(id) {
    return id.$.split('-')[0];
}

exports.objID = function(id) {
    return id.$.split('-')[1];
}
