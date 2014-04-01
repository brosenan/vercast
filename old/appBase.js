var util = require('./util.js');

module.exports = function(evalEnv, graphDB) {
    var self = this;
    this.trans = function(s1, patch, options, cb) {
	util.depend([
	    function(_) { evalWithEffects(s1, [patch], options, false, _('s2', 'conf')); },
	    function(_) { evalEnv.hash(patch, _('patchHash')); },
	    function(s2, patchHash, _) { graphDB.addEdge(s1.$hash$, patchHash.$hash$, s2.$hash$, _('doneGraph')); },
	    function(s2, conf, doneGraph, _) { cb(undefined, s2, conf); },
	], cb);
    };
    function evalWithEffects(s0, patches, options, conf0, cb) {
	if(patches.length == 0) {
	    return cb(undefined, s0, conf0);
	}
	util.depend([
	    function(_) 
	    { evalEnv.trans(s0, patches[0], _('s1', 'res', 'eff', 'conf1')); },
	    function(s1, eff, conf1, _) 
	    {
		evalWithEffects(s1, 
				patches.slice(1).concat(eff), 
				options,
				conf0 || conf1,
				cb);
	    },
	], cb);
    }

    this.merge = function(dest, source, options, cb) {
	util.depend([
	    function(_) 
	    { evalEnv.hash(dest, _('destHash')); },
	    function(_) 
	    { evalEnv.hash(source, _('sourceHash')); },
	    function(sourceHash, destHash, _) 
	    { graphDB.findCommonAncestor(sourceHash.$hash$, destHash.$hash$, _('ancestor', 'path1', 'path2')); },
	    function(path1, destHash, _)
	    { self.trans(destHash, createPathPatch(path1, options), options, _('newState', 'conf')); },
	    function(path2, _)
	    { evalEnv.hash(createPathPatch(path2, options), _('path2Hashed')); },
	    function(path2Hashed, newState, sourceHash, _) 
	    { graphDB.addEdge(sourceHash.$hash$, path2Hashed.$hash$, newState.$hash$, _('doneGraph')); },
	    function(doneGraph, newState, conf, path1, _) 
	    { cb(undefined, newState, conf, createPathPatch(path1, options)); },
	], cb);
    };

    function createPathPatch(path, options) {
	return {_type: 'comp',
		weak: options.weak,
		patches: path.map(function(x) {
		    return {$hash$: x};
		}),
	       };
    }

    this.hash = function(obj, cb) {
	evalEnv.hash(obj, cb);
    };
    this.query = function(state, patch, cb) {
	evalEnv.query(state, patch, cb);
    };
    this.init = function(evaltor, args, cb) {
	evalEnv.init(evaltor, args, cb);
    };
};