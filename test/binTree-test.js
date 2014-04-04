assert = require('assert');
ObjectDisp = require('../objectDisp.js');
DummyObjectStore = require('../dummyObjectStore.js');
CheckerObjectStore = require('./checkerObjectStore.js');

var disp = new ObjectDisp({
    Counter: require('../counter.js'),
    BinTree: require('../binTree.js'),
    ':inv': require('../inv.js'),
    ':digest': require('../defaultDigest.js'),
});
var ostore = new CheckerObjectStore(new DummyObjectStore(disp));

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

    describe('getMin', function(){
	it('should retrieve the the minimum key, with its associated value', function(done){
	    function createTree(list) {
		var v = ostore.init({}, 'BinTree', {key: list[0][0], value: list[0][1]});
		for(var i = 1; i < list.length; i++) {
		    v = ostore.trans({}, v, {_type: 'add', key: list[i][0], value: list[i][1]})[0];
		}
		return v;
	    }

	    var v = createTree([[4, 8], [2, 4], [5, 10], [3, 6]]);
	    var r = ostore.trans({}, v, {_type: 'getMin'})[1];
	    assert.equal(r.key, 2);
	    assert.equal(r.value, 4);
	    done();
	});
    });
    function createTree(list) {
	var v = ostore.init({}, 'BinTree', {key: list[0][0], value: list[0][1]});
	for(var i = 1; i < list.length; i++) {
	    v = ostore.trans({}, v, {_type: 'add', key: list[i][0], value: list[i][1]})[0];
	}
	return v;
    }

    describe('remove', function(){
	it('should remove the element with the given key and value', function(done){
	    function allInTree(v, list) {
		for(var i = 0; i < list.length; i++) {
		    if(!ostore.trans({}, v, {_type: 'fetch', key: list[i]})[1]) return false;
		}
		return true;
	    }
	    // Remove a node that has one child
	    var v = createTree([[4, 8], [2, 4], [5, 10], [3, 6]]);
	    var removed2 = ostore.trans({}, v, {_type: 'remove', key: 2, value: 4})[0];
	    var r = ostore.trans({}, removed2, {_type: 'fetch', key: 2})[1];
	    assert(!r, 'key 2 should be removed');
	    assert(allInTree(removed2, [4, 5, 3]), '4, 5, and 3 should remain in the tree');
	    // Remove a node with two children
	    var removed4 = ostore.trans({}, v, {_type: 'remove', key: 4, value: 8})[0];
	    var r = ostore.trans({}, removed4, {_type: 'fetch', key: 4})[1];
	    assert(!r, 'key 4 should be removed');
	    assert(allInTree(removed4, [2, 5, 3]), '2, 5, and 3 should remain in the tree');
	    done();
	});
    });
});
