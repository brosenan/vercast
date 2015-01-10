"use strict";
var AWS = require('aws-sdk');
var uuid = require('node-uuid');

module.exports = function(table, region) {
    var db = new AWS.DynamoDB({region: region});
    this.append = function*(bucketName, elements) {
	var tuid = uuid.v1();
	var item = {
	    bucket: {S: bucketName},
	    tuid: {S: tuid},
	    elems: {L: elements.map(function(x) {
		return {S: JSON.stringify(x)};
	    })},
	};
	yield function(_) {
	    db.putItem({Item: item, TableName: table}, _);
	};
	return tuid;
    };
    this.retrieve = function*(bucket, tuid, giveTuid) {
	var query = {
	    TableName: table,
	    KeyConditions: {
		bucket: {
		    AttributeValueList: [
			{S: bucket},
		    ],
		    ComparisonOperator: 'EQ',
		},
	    },
	};
	if(tuid) {
	    query.KeyConditions.tuid = {		    
		AttributeValueList: [
		    {S: tuid},
		],
		ComparisonOperator: 'GT',
	    };
	}
	var res = yield function(_) {
	    db.query(query, _);
	};
	var elems = [];
	res.Items
	    .map(function(x) { return x.elems.L; })
	    .forEach(function(x) { elems = elems.concat(x); });
	elems =  elems
	    .map(function(x) { return x.S; })
	    .map(JSON.parse);
	if(giveTuid) {
	    return {elems: elems,
		    tuid: res.Items[res.Items.length - 1].tuid.S};
	} else {
	    return elems;
	}
    };
};
