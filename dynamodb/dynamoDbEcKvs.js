"use strict";
var AWS = require('aws-sdk');

module.exports = function(table, region) {
    var db = new AWS.DynamoDB({region: region});
    this.newKey = function*(key, value) {
	var item = {
	    key: {S: key},
	    value: {S: value},
	};
	yield function(_) {
	    db.putItem({Item: item, TableName: table}, _);
	};
    };
    this.retrieve = function*(key) {
	var query = {
	    TableName: table,
	    KeyConditions: {
		key: {
		    AttributeValueList: [
			{S: key},
		    ],
		    ComparisonOperator: 'EQ',
		},
	    },
	};
	var res = yield function(_) {
	    db.query(query, _);
	};
	if(res.Count > 0) {
	    return res.Items[0].value.S;
	}
    };

    this.modify = function*(key, value) {
	yield* this.newKey(key, value);
    };
};
