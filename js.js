exports.init = function(ctx, args) {
    this.main = args.main;
}
exports.relayPatch = function(ctx, p, u) {
    var path = p.patch._path;
    var code = ctx.query(p.self, {_type: 'get', _path: path.concat(this.main)});
    var func = new Function(['exports'], code);
    var exports = {};
    func.call(undefined, exports);
    return exports[p.patch._type]();
}