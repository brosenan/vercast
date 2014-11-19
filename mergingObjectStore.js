"use strict";
module.exports = function(ostore, versionGraph, seqFactory) {
    this.init = function(type, args) {
	return ostore.init(type, args);
    };
    this.trans = function*(v, p, u) {
	var seq = seqFactory.createSequenceStore();
	yield* seq.append(p);
	var res = yield* ostore.trans(v, p, u);
	var ph = yield* seq.hash();
	yield* versionGraph.recordTrans(v, ph, res.v);
	return res;
    };
    this.merge = function*(v1, v2) {
	var mergeInfo = yield* versionGraph.getMergeStrategy(v1, v2);
	var seq = seqFactory.createSequenceStore();
	yield* versionGraph.appendPatchesTo(mergeInfo, seq);
	var v = v1;
	while(!seq.isEmpty()) {
	    var p = yield* seq.shift();
	    v = (yield* ostore.trans(v, p)).v;
	}
	return v;
    };
};
