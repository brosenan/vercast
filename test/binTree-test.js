assert = require('assert');
ObjectDisp = require('../objectDisp.js');
DummyObjectStore = require('../dummyObjectStore.js');

var disp = new ObjectDisp({
    Counter: require('../counter.js'),
    BinTree: require('../binTree.js'),
});
var ostore = new DummyObjectStore(disp);

describe('BinTree', function(){
    describe('init', function(){
	it('should initialize a binary tree with a single element', function(done){
	    var tree = disp.init({}, 'BinTree', {key: 'foo', value: 'bar'});
	    assert.equal(tree.key, 'foo');
	    assert.equal(tree.value, 'bar');
	    assert.equal(tree.left, null);
	    assert.equal(tree.right, null);
	    done();
	});
    });
    describe('fetch', function(){
	it('should return the value associated with a key', function(done){
	    var v = ostore.init({}, 'BinTree', {key: 'foo', value: 'bar'});
	    var pair = ostore.trans({}, v, {_type: 'fetch', key: 'foo'});
	    assert.equal(pair[1], 'bar');
	    done();
	});
	it('should return undefined if the key is not in the tree', function(done){
	    var v = ostore.init({}, 'BinTree', {key: 'foo', value: 'bar'});
	    var pair = ostore.trans({}, v, {_type: 'fetch', key: 'FOO'});
	    assert.equal(typeof pair[1], 'undefined');
	    done();
	});
    });

    describe('add', function(){
	it('should add a leaf to the tree, based on key comparison', function(done){
	    var v = ostore.init({}, 'BinTree', {key: 'foo', value: 'bar'});
	    v = ostore.trans({}, v, {_type: 'add', key: 'bar', value: 'baz'})[0];
	    v = ostore.trans({}, v, {_type: 'add', key: 'kar', value: 'fuzz'})[0];
	    assert.equal(ostore.trans({}, v, {_type: 'fetch', key: 'foo'})[1], 'bar');
	    assert.equal(ostore.trans({}, v, {_type: 'fetch', key: 'bar'})[1], 'baz');
	    assert.equal(ostore.trans({}, v, {_type: 'fetch', key: 'kar'})[1], 'fuzz');
	    done();
	});
	it('should report a conflict and not change the state if the the key already exists', function(done){
	    var conflicting = false;
	    var ctx = {
		conflict: function() { conflicting = true; }
	    };
	    var v0 = ostore.init(ctx, 'BinTree', {key: 'foo', value: 'bar'});
	    var v1 = ostore.trans(ctx, v0, {_type: 'add', key: 'foo', value: 'baz'})[0];
	    assert(conflicting, 'Should be conflicting');
	    assert.equal(v0.$, v1.$);
	    done();
	});
    });
});
