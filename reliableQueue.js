"use strict";
var fs = require('fs');

var uuid = require('node-uuid');
var LineByLineReader = require('line-by-line');
var glob = require('glob');

function* fileExists(path) {
    return yield function(_) {
	fs.exists(path, function(res) {
	    _(undefined, res);
	});
    };
}

module.exports = function(dir, pkqSize) {
    var initialized = false;
    var queue = [];
    var currFile = null;
    var currFileName = null;
    var numElemesInPkg = 0;
    var fileTuids = Object.create(null);

    this.push = function*(elem) {
	var tuid = uuid.v1();
	yield* init();
	var q = {t: tuid, e: elem};
	queue.push(q);
	yield* writeToFile(q, tuid);
	return tuid;
    };
    this.getAll = function*(getTuid) {
	yield* init();
	var oldQueue = queue;
	queue = [];
	var ret = oldQueue.map(function(q) { return q.e; });
	if(getTuid) {
	    if(oldQueue.length > 0) {
		return {elems: ret, tuid: oldQueue[oldQueue.length-1].t};
	    } else {
		return {elems: ret, tuid: ''};
	    }
	} else {
	    return ret;
	}
    };
    this.acknowledge = function*(tuid) {
	queue = queue.filter(function(q) {
	    return q.tuid > tuid;
	});
	var oldFiles = yield function(_) { glob(dir + '/*.json', _); };
	for(let i = 0; i < oldFiles.length; i++) {
	    if(fileTuids[oldFiles[i]] < tuid) {
		yield function(_) { fs.unlink(oldFiles[i], _); };
		delete fileTuids[oldFiles[i]];
	    }
	}
    };

    function* init() {
	if(initialized) return;
	initialized = true;
	
	if(!(yield* fileExists(dir))) {
	    yield function(_) { fs.mkdir(dir, _); };
	}
	var files = yield function(_) { glob(dir + '/*.json', _); };
	for(let i = 0; i < files.length; i++) {
	    var lr = new LineByLineReader(files[i]);
	    lr.on('line', function(line) {
		let q = JSON.parse(line);
		queue.push(q);
		fileTuids[files[i]] = q.tuid;
	    });
	    yield function(_) {
		lr.on('error', _);
		lr.on('end', _);
	    };
	}
    }

    function* writeToFile(elem, tuid) {
	if(numElemesInPkg >= pkqSize) {
	    yield function(_) { currFile.end(_); };
	    currFile = null;
	    numElemesInPkg = 0;
	}
	if(!currFile) {
	    currFileName = dir + '/' + tuid + '.json';
	    currFile = fs.createWriteStream(currFileName);
	}
	numElemesInPkg += 1;
	yield function(_) { 
	    currFile.write(JSON.stringify(elem) + '\n', 'utf-8', _); 
	};
	fileTuids[currFileName] = tuid;
    }
};