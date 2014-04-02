var assert = require('assert');

module.exports = function(ostore) {
    this.transHooks = [];

    this.init = function(ctx, className, args) {
	return ostore.init(ctx, className, args);
    }

    this.trans = function(ctx, v1, p) {
	ctx = createContext(ctx);
	var pair = ostore.trans(ctx, v1, p);
	for(var i = 0; i < this.transHooks.length; i++) {
	    this.transHooks[i].call(this, v1, p, pair[0], pair[1], ctx.isConflicting());
	}
	return pair;
    }

    this.onTrans = function(func) {
	this.transHooks.push(func);
    }

//    this.onTrans(checkInvertibility);

    this.ostore = ostore;
    

}

function createContext(ctx) {
    return {
	conf: false,
	conflict: function() { this.conf = true; if(ctx.conflict) ctx.conflict(); },
	isConflicting: function() { return this.conf; },
    };
}

function checkInvertibility(v1, p, v2, r, c) {
    // A conflicting transition is not expected to be invertible.
    if(c) return;
    
    var ctx = createContext({});
    var pair = this.ostore.trans(ctx, v2, {_type: 'inv', patch: p});
    if(pair[0].$ != v1.$) {
	console.error('Non-invertible patch:', p);
	console.error('From state:', v2);
	console.error('Moved to:', pair[0]);
	console.error('Instead of:', v1);
	throw new Error('Patch ' + p._type + ' is not invertible');
    }
    if(JSON.stringify(pair[1]) != JSON.stringify(r)) {
	console.error('Result on forward pass:', r);
	console.error('Result on backwrads pass:', pair[1]);
	console.error('Patch:', p);
	console.error('v1:', v1);
	console.error('v2:', v2);
	throw new Error('Inconsistent result when inverting patch ' + p._type);
    }
}
