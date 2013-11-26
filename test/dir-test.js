var EvalEnv = require('../evalEnv.js');
var util = require('../util.js');
var assert = require('assert');
var HashDB = require('../hashDB.js');
var DummyKVS = require('../keyvalue.js');

var evaluators = {
    atom: require('../atom.js'),
    dir: require('../dir.js'),
    inv: require('../inv.js'),
};

describe('directory', function(){
    var evalEnv;
    var hashDB;
    beforeEach(function() {
	var kvs = new DummyKVS();
	hashDB = new HashDB(kvs);
	evalEnv = new EvalEnv(hashDB, kvs, evaluators);
    });
    it('should propagate any patches it does not handle itself to child objects', function(done){
	util.seq([
	    function(_) { evalEnv.init('dir', {}, _.to('s0')); },
	    function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
	    function(_) { evalEnv.trans(this.s1, {_type: 'set', _path: ['foo'], from: 'bar', to: 'baz'}, _.to('s2')); },
	    function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _.to('res')); },
	    function(_) { assert.equal(this.res, 'baz'); _(); },
	], done)();
    });
    it('should propagate unapplied patches as well as applied', function(done){
	util.seq([
	    function(_) { evalEnv.init('dir', {}, _.to('s0')); },
	    function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'baz'}}, _.to('s1')); },
	    function(_) { evalEnv.apply(this.s1, {_type: 'set', _path: ['foo'], from: 'bar', to: 'baz'}, true, _.to('s2')); },
	    function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _.to('res')); },
	    function(_) { assert.equal(this.res, 'bar'); _(); },
	], done)();
    });

    describe('create', function(){
	it('should create a child node using the given evaluator type and arguments', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get', _path: ['foo']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
	    ], done)();
	});
	it('should delete a child when unapplied', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.apply(this.s1, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, true, _.to('s2', 'res', 'eff', 'conf')); },
		function(_) { assert(!this.conf, 'should not be conflicting'); _(); },
		function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _); },
	    ], function(err) {
		assert(err, 'an error should be emitted');
		done((err.message != 'Invalid path: foo' && err) || undefined);
	    })();
	});
	it('should report a conflict when unpatched if the child state does not match the construction parameters', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.trans(this.s1, {_type: 'set', _path: ['foo'], from: 'bar', to: 'baz'}, _.to('s2')); },
		function(_) { evalEnv.apply(this.s2, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, true, _.to('s3', 'res', 'eff', 'conf')); },
		function(_) { assert(this.conf, 'should be conflicting'); _(); },
	    ], done)();
	});

    });
    describe('delete', function(){
	it('should remove the object at the given path from the directory', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get_hash', _path: ['foo']}, _.to('childHash')); },
		function(_) { evalEnv.trans(this.s1, {_type: 'delete', _path: ['foo'], hash: this.childHash}, _.to('s2')); },
		function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _); },
	    ], function(err) {
		assert(err, 'an error should be emitted');
		done((err.message != 'Invalid path: foo' && err) || undefined);
	    })();
	});
	it('should report a conflic if the removed child state does not match the given hash', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get_hash', _path: ['foo']}, _.to('beforeChange')); },
		function(_) { evalEnv.trans(this.s1, {_type: 'set', _path: ['foo'], from: 'bar', to: 'baz'}, _.to('s2')); },
		function(_) { evalEnv.trans(this.s2, {_type: 'delete', _path: ['foo'], hash: this.beforeChange}, _.to('s3', 'res', 'eff', 'conf')); },
		function(_) { assert(this.conf, 'should be conflicting'); _(); },
	    ], done)();
	});
	it('should re-create a child if unapplied', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.init('atom', {val: 'bar'}, _.to('child')); },
		function(_) { hashDB.hash(this.child, _.to('child')); },
		function(_) { evalEnv.apply(this.s0, {_type: 'delete', _path: ['foo'], hash: this.child}, true, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get', _path: ['foo']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
	    ], done)();
	});
	it('should conflict when unapplied if the child already exists', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.init('atom', {val: 'bar'}, _.to('child')); },
		function(_) { hashDB.hash(this.child, _.to('child')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: '!@#!@#'}}, _.to('s1')); },
		function(_) { evalEnv.apply(this.s1, {_type: 'delete', _path: ['foo'], hash: this.child}, true, _.to('s2', 'res', 'eff', 'conf')); },
		function(_) { assert(this.conf, 'should be conflicting'); _(); },
		function(_) { evalEnv.query(this.s2, {_type: 'get', _path: ['foo']}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
	    ], done)();
	});

    });
    describe('get_hash', function(){
	it('should return the hash of the child at the given path', function(done){
	    util.seq([
		function(_) { evalEnv.init('dir', {}, _.to('s0')); },
		function(_) { evalEnv.trans(this.s0, {_type: 'create', _path: ['foo'], evalType: 'atom', args: {val: 'bar'}}, _.to('s1')); },
		function(_) { evalEnv.query(this.s1, {_type: 'get_hash', _path: ['foo']}, _.to('child')); },
		function(_) { evalEnv.query(this.child, {_type: 'get'}, _.to('res')); },
		function(_) { assert.equal(this.res, 'bar'); _(); },
	    ], done)();
	});
    });
});