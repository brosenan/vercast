"use strict";
var neo4j = require('neo4j');
var asyncgen = require('asyncgen');

var db = new neo4j.GraphDatabase('http://localhost:7474');

var pendingNodes = {};
var pendingEdges = [];
var pendingIndex = 0;

function* storePending() {
    var cypher = "";
    var params = {};
    Object.keys(pendingNodes).forEach(function(id) {
	cypher += "MERGE (v" + pendingNodes[id] + ":ver {id:{v" + pendingNodes[id] + "}})\n";
	params["v" + pendingNodes[id]] = id;
    });
    for(let i = 0; i < pendingEdges.length; i++) {
	var src = pendingNodes[pendingEdges[i][0]];
	var dest = pendingNodes[pendingEdges[i][2]];
	cypher += "CREATE UNIQUE (v" + src + ")-[:TRANS {patch:{p" + i + "}}]->(v" + dest + ")\n"
	params["p" + i] = pendingEdges[i][1];
    }
    yield* query(cypher, params);
    pendingNodes = {};
    pendingEdges = [];
    pendingIndex = 0;
}

function* query(cypher, params) {
    params = params || {};
    var timeBefore = Date.now();
    try {
	var res = yield function(_) {
	    db.query(cypher, params, _);
	};
    } catch(e) {
	throw Error(e.message + " in " + cypher);
    }
    //console.log(cypher, params, Date.now() - timeBefore);
    return res;
}

module.exports = function() {
    this.clear = function*() {
	yield* query("MATCH (x)-[r]->(y) DELETE r;");
	yield* query("MATCH (x) DELETE x;");
    };

    this.addEdge = function*(v1, p, v2) {
	pendingNodes[v1] = pendingIndex;
	pendingIndex += 1;
	pendingNodes[v2] = pendingIndex;
	pendingIndex += 1;
	pendingEdges.push([v1, p, v2]);
    }
    this.queryEdge = function*(v1, p) {
	yield* storePending();
	var res = yield* query(
	    "START v1=node:node_auto_index(id={v1}) " +
		"MATCH (v1)-[:TRANS {patch: {p}}]->(v2) " +
		"RETURN v2",
	    {v1: v1, p: p});
	if(res.length == 0) {
	    throw Error("No edge " + p + " departing from " + v1);
	} else if(res.length > 1) {
	    throw Error("Multiple edges " + p + " departing from " + v1);
	} else {
	    return res[0].v2.data.id;
	}
    };
    this.queryBackEdge = function*(v2, p) {
	yield* storePending();
	var res = yield* query(
	    "START v2=node:node_auto_index(id={v2}) " +
		"MATCH (v1)-[:TRANS {patch: {p}}]->(v2) " +
		"RETURN v1",
	    {v2: v2, p: p});
	if(res.length == 0) {
	    throw Error("No edge " + p + " reaching " + v2);
	} else if(res.length > 1) {
	    throw Error("Multiple edges " + p + " reaching " + v2);
	} else {
	    return res[0].v1.data.id;
	}
    };
    this.findCommonAncestor = function*(v1, v2) {
	yield* storePending();
	var cypher = 
	    'START v1=node:node_auto_index(id={v1}), v2=node:node_auto_index(id={v2})' +
	    'MATCH path=v1<-[:TRANS*]-common_ancestor-[:TRANS*]->v2                  ' +
	    'RETURN common_ancestor as LCA, relationships(path) as rels, nodes(path) as nodes   ' +
	    'ORDER BY length(path)                                                   ' +
	    'LIMIT 1                                                                 ';
	var res = yield* query(cypher, {v1: v1, v2: v2});
	if(res.length !== 1) {
	    throw Error('Could not find (unique) LCA for ' + v1 + " and " + v2);
	}
	var p1 = [], p2 = [];
	var rels = res[0].rels;
	var nodes = res[0].nodes;
	var seenTheLCA = false;
	for(let i = 0; i < rels.length; i++) {
	    if(!seenTheLCA) {
		p1.unshift({n: nodes[i].data.id, l: rels[i].data.patch});
		if(nodes[i+1].data.id === res[0].LCA.data.id) {
		    seenTheLCA = true;
		}
	    } else {
		p2.push({l: rels[i].data.patch, n: nodes[i+1].data.id});
	    }
	}
	return {node: res[0].LCA.data.id,
		p1: p1,
		p2: p2};
    };
    this.findPath = function*(v1, v2) {
	yield* storePending();
	var cypher =
	    "START v1=node:node_auto_index(id={v1}) " +
	    "    , v2=node:node_auto_index(id={v2}) " +
	    "MATCH path=(v1)-[:TRANS*]->(v2)        " +
	    "RETURN relationships(path) as rels, nodes(path) as nodes " +
	    "ORDER BY length(path)                  " +
	    "LIMIT 1";
	var res = yield* query(cypher, {v1: v1, v2: v2});
	var path = [];
	if(res.length !== 1) {
	    throw Error('Could not find path from ' + v1 + " to " + v2);
	}
	var rels = res[0].rels;
	for(let i = 0; i < rels.length; i++) {
	    path.push(rels[i].data.patch);
	}
	return path;
    };
};