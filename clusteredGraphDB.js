"use strict";
module.exports = function(externalGraphDB) {
    this.clear = function*() {
	yield* externalGraphDB.clear();
    };
    this.addEdge = function*(v1, e, v2) {
	yield* externalGraphDB.addEdge(v1, e, v2);
    };
    this.queryEdge = function*(v1, e) {
	return yield* externalGraphDB.queryEdge(v1, e);
    };
    this.queryBackEdge = function*(v2, e) {
	return yield* externalGraphDB.queryBackEdge(v2, e);
    };
    this.findCommonAncestor = function*(v1, v2) {
	return yield* externalGraphDB.findCommonAncestor(v1, v2);
    };
    this.findPath = function(v1, v2) {
	return externalGraphDB.findPath(v1, v2);
    };
};