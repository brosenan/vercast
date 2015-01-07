"use strict";
var AWS = require('aws-sdk');
var uuid = require('node-uuid');

module.exports = function(table, region) {
    var db = new AWS.DynamoDB({region: region});
    this.append = function*(bucketName, elements) {
	var item = {
	    bucket: {S: bucketName},
	    tuid: {S: uuid.v1()},
	    elems: {L: elements.map(function(x) {
		return {S: JSON.stringify(x)};
	    })},
	};
	yield function(_) {
	    db.putItem({Item: item, TableName: table}, _);
	};
    };
    this.retrieve = function*() { return []; };
};