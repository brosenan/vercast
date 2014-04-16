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

function findChildren(obj, list) {
    if(!obj) return;
    if(obj.$) {
	list.push(obj);
    } else if(Array.isArray(obj)) {
	for(var i = 0; i < obj.length; i++) {
	    findChildren(obj[i], list);
	}
    } else if(typeof obj == 'object') {
	for(var key in obj) {
	    findChildren(obj[key], list);
	}
    }
}

exports.childObjects = function(obj) {
    var list = [];
    findChildren(obj, list);
    return list;
}

exports.Tracer = function(module) {
    this.trace = function(str) {
	if(exports.trace_on) {
	    console.log(module + ':', str);
	}
    }
}

exports.randomByKey = function(key, prob) {
    var hash = crypto.createHash('sha256');
    hash.update(key);
    var buff = hash.digest();
    var value = 0;
    var norm = 1;
    var numBytes = Math.min(buff.length, 6);
    for(var i = 0; i < numBytes; i++) {
	value *= 256;
	norm *= 256;
	value += buff[i];
    }
    var rand = value / norm;
    return rand < prob;
}
