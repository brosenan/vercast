"use strict";
var AWS = require('aws-sdk');

module.exports = function(table, region) {
    var db = new AWS.DynamoDB({region: region});
    this.newKey = function*(key, value) {
	var item = {
	    key: {S: key},
	    value: {S: value},
	};
	var request = {
	    Item: item, 
	    TableName: table,
	    ReturnValues: 'ALL_OLD',
	};
	var res = yield function(_) {
	    db.putItem(request, _);
	};
	if(res.Attributes) {
	    throw Error('Key ' + key + ' already exists');
	}
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
	} else {
	    throw Error('Key ' + key + ' was not found');
	}
    };

    this.modify = function*(key, value, newValue) {
	var oldValue;
	if(typeof newValue !== 'undefined') {
	    oldValue = value;
	} else {
	    newValue = value;
	}
	var request = {
	    Key: {key: {S: key}},
	    UpdateExpression: "SET #val = :newValue",
	    TableName: table,
	    ReturnValues: 'ALL_OLD',
	    ExpressionAttributeNames: {'#val': 'value'},
	    ExpressionAttributeValues: {':newValue': {S: newValue}},
	};
	if(oldValue) {
	    request.ConditionExpression = '#val = :oldValue';
	    request.ExpressionAttributeValues[':oldValue'] = {S: oldValue};
	}
	try {
	    var res = yield function(_) {
		db.updateItem(request, _);
	    };
	    return newValue;
	} catch(e) {
	    if(e.code !== 'ConditionalCheckFailedException') {
		throw e;
	    }
	}
    };
};
