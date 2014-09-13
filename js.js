exports.init = function(ctx, args) {
    this.main = args.main;
}

var cache = Object.create(null);

function load(ctx, dir, path, name) {
    var key = ctx.query(dir, {_type: '_get_id', _path: path.concat([name])}).$;
    var func;
    if(key in cache) {
	func = cache[key];
    } else {
	var code = ctx.query(dir, {_type: 'get', _path: path.concat(name)});
	func = new Function(['exports', 'require'], code);
	cache[key] = func;
    }

    function _require(name) {
	return load(ctx, dir, path, name);
    }
    var exports = {};
    func.call(undefined, exports, _require);
    return exports;
}

function createContext(ctx, self, path) {
    return {
	query: function(name, patch) {
	    patch._path = path.concat([name]);
	    return ctx.query(self, patch);
	},
    };
}

exports.relayPatch = function(ctx, p, u) {
    var exports = load(ctx, p.self, p.patch._path, this.main);
    return exports[p.patch._type](createContext(ctx, p.self, p.patch._path));
}
