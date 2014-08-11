var assert = require('assert');

module.exports = function(ostore) {
    this.transHooks = [];

    this.init = function(ctx, className, args) {
	return ostore.init(ctx, className, args);
    }

    this.trans = function(ctx, v1, p) {
	var pair = ostore.trans(ctx, v1, p);
	if(ctx.error) return pair;

	for(var i = 0; i < this.transHooks.length; i++) {
	    this.transHooks[i].call(this, v1, p, pair[0], pair[1], ctx.conf);
	}
	return pair;
    }

    this.onTrans = function(func) {
	this.transHooks.push(func);
    }

    this.onTrans(checkInvertibility);

    this.ostore = ostore;
    

}


function checkInvertibility(v1, p, v2, r, c) {
    // A conflicting transition is not expected to be invertible.
    if(c) return;
    
    var ctx = {};
    var pair = this.ostore.trans(ctx, v2, {_type: 'inv', patch: p});
    if(ctx.error) throw ctx.error;

    if(JSON.stringify(pair[1]) != JSON.stringify(r)) {
	console.error('Result on forward pass:', r);
	console.error('Result on backwrads pass:', pair[1]);
	console.error('Patch:', p);
	console.error('v1:', v1);
	console.error('v2:', v2);
	throw new Error('Inconsistent result when inverting patch ' + p._type);
    }

    v1Prime = pair[0];
    if(v1Prime.$ == v1.$) return;
    var v1Digest = this.ostore.trans(ctx, v1, {_type: 'digest'})[1];
    var v1PrimeDigest = this.ostore.trans(ctx, v1Prime, {_type: 'digest'})[1];
    if(v1Digest == v1PrimeDigest) return;

    var v2Digest = this.ostore.trans(ctx, v2, {_type: 'digest'})[1];
    console.error('Non-invertible patch:', p);
    console.error('From state:', v2Digest);
    console.error('Moved to:', v1PrimeDigest);
    console.error('Instead of:', v1Digest);
    throw new Error('Patch ' + p._type + ' is not invertible');

}
