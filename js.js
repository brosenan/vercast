exports.init = function(ctx, args) {
    this.main = args.main;
}

var cache = Object.create(null);

function load(ctx, dir, path, name) {
    var key = dir.$ + ':' + name;
    if(key in cache) {
	return cache[key];
    }
    var code = ctx.query(dir, {_type: 'get', _path: path.concat(name)});
    var func = new Function(['exports', 'require'], code);
    var exports = {};
    function _require(name) {
	return load(ctx, dir, path, name);
    }
    func.call(undefined, exports, _require);
    cache[key] = exports;
    return exports;
}

exports.relayPatch = function(ctx, p, u) {
    var exports = load(ctx, p.self, p.patch._path, this.main);
    return exports[p.patch._type]();
}