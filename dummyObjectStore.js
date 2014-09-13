module.exports = function(disp) {
    var self = this;

    this.init = function(ctx, className, args) {
	obj = disp.init(createContext(ctx), className, args);
	return {$: JSON.stringify(obj)};
    };
    this.trans = function(ctx, v1, p) {
	if(!v1.$) throw new Error('Bad ID: ' + v1.$);
	try {
	    var pair = disp.apply(createContext(ctx, v1), JSON.parse(v1.$), p);
	} catch(e) {
	    ctx.error = e;
	    return [undefined, undefined];
	}
	if('_replaceWith' in pair[0]) {
	    pair[0] = pair[0]._replaceWith;
	} else {
	    pair[0] = {$: JSON.stringify(pair[0])};
	}
	return pair;
    };

    function createContext(ctx, v0) {
	return {
	    init: function(className, args) {
		return self.init(ctx, className, args);
	    },
	    trans: function(v1, p) {
		var pair = self.trans(ctx, v1, p);
		if(pair[1]) throw new Error('Transition returned unexpected value: ' + pair[1]);
		return pair[0];
	    },
	    query: function(v1, p) {
		var pair = self.trans(ctx, v1, p);
		if(pair[0].$ != v1.$) throw new Error('Query patch ' + p._type + ' unexpectedly modified object value');
		return pair[1];
	    },
	    transQuery: function(v1, p) {
		return self.trans(ctx, v1, p);
	    },
	    conflict: function() {
		ctx.conf = true;
	    },
	    effect: function(eff) {
		if(ctx.eff) {
		    ctx.eff.push(eff);
		} else {
		    ctx.eff = [eff];
		}
	    },
	    self: function() {
		return v0;
	    },
	};
    }
}
