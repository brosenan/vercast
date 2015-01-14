"use strict";
var assert = require('assert');

var vercast = require('vercast');
var asyncgen = require('asyncgen');
var glob = require('glob');
var rmdir = require('rmdir');

var queueDir = '/tmp/queue-test-' + Math.floor(Math.random() * 1000000) + '-';

describe('ReliableQueue', function(){
    beforeEach(asyncgen.async(function*() {
	var dirs = yield function(_) { glob('/tmp/queue-test-*', _); };
	for(let i = 0; i < dirs.length; i++) {
	    yield function(_) { rmdir(dirs[i], _); };
	}
    }));
    describe('.push(elem)', function(){
	it('should return a time-uuid', asyncgen.async(function*(){
	    var queue = new vercast.ReliableQueue(queueDir + '1');
	    var tuid1 = yield* queue.push({a:1});
	    var tuid2 = yield* queue.push({a:2});
	    assert(tuid2 > tuid1, tuid2 + " > " + tuid1);
	}));
    });
    describe('.getAll()', function(){
	it('should return all the elements that have been pushed to the queue', asyncgen.async(function*(){
	    var queue = new vercast.ReliableQueue(queueDir + '2');
	    yield* queue.push({a:1});
	    yield* queue.push({a:2});
	    var elems = yield* queue.getAll();
	    assert.deepEqual(elems, [{a:1}, {a:2}]);
	}));
	it('should clear the elements so that further calls do not retrieve the same items', asyncgen.async(function*(){
	    var queue = new vercast.ReliableQueue(queueDir + '3');
	    yield* queue.push({a:1});
	    yield* queue.push({a:2});
	    assert.deepEqual(yield* queue.getAll(), [{a:1}, {a:2}]);
	    yield* queue.push({a:3});
	    assert.deepEqual(yield* queue.getAll(), [{a:3}]);
	}));
	it('should also return elements pushed by a previous (crashed) instance looking at the same directory', asyncgen.async(function*(){
	    var queue1 = new vercast.ReliableQueue(queueDir + '4');
	    yield* queue1.push({a:1});
	    yield* queue1.push({a:2});
	    var queue2 = new vercast.ReliableQueue(queueDir + '4');
	    assert.deepEqual(yield* queue2.getAll(), [{a:1}, {a:2}]);
	}));
    });
    describe('.acknowledge(tuid)', function(){
	it('should not repeat acknowledged elements', asyncgen.async(function*(){
	    var queue = new vercast.ReliableQueue(queueDir + '5');
	    var tuid = yield* queue.push({a:1});
	    yield* queue.acknowledge(tuid);
	    yield* queue.push({a:2});
	    assert.deepEqual(yield* queue.getAll(), [{a:2}]);
	}));
	it('should not repeat more than a given number of acknowledged elements when recovering from failure', asyncgen.async(function*(){
	    var queue1 = new vercast.ReliableQueue(queueDir + '6', 2);
	    yield* queue1.push({a:1});
	    yield* queue1.push({a:2});
	    yield* queue1.push({a:3});
	    var tuid = yield* queue1.push({a:4});
	    yield* queue1.acknowledge(tuid);
	    yield* queue1.push({a:5});
	    var queue2 = new vercast.ReliableQueue(queueDir + '6', 2);
	    var recovered = yield* queue2.getAll();
	    assert(recovered[0].a >= 3, recovered[0].a + ' >= 3');
	    assert(recovered[0].a <= 5, recovered[0].a + ' <= 5');
	    assert.deepEqual(recovered[recovered.length - 1], {a:5});
	}));

	it('should recover all elements since the acknowledgement', asyncgen.async(function*(){
	    var queue1 = new vercast.ReliableQueue(queueDir + '6', 3);
	    yield* queue1.push({a:1});
	    var tuid = yield* queue1.push({a:2});
	    yield* queue1.push({a:3});
	    yield* queue1.acknowledge(tuid);
	    yield* queue1.push({a:4});
	    yield* queue1.push({a:5});
	    yield* queue1.push({a:6});
	    yield* queue1.push({a:7});
	    var queue2 = new vercast.ReliableQueue(queueDir + '6', 3);
	    var recovered = yield* queue2.getAll();
	    assert(recovered[0].a <= 3, recovered[0].a + ' <= 3');
	    assert.deepEqual(recovered[recovered.length - 1], {a:7});
	}));

    });

});
