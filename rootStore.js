"use strict";

module.exports = function(ostore) {
    this.init = function(type, args) {
	return ostore.init(type, args);
    };
};
