var assert = require('assert');
var Scheduler = require('../scheduler.js')

describe('Scheduler', function(){
    it('allows users to register a callback to a condition. Once the condition is met, the callback is called', function(done){
	var sched = new Scheduler();
	var called = false;
	sched.register(['foo'], function() {
	    called = true;
	});
	assert(!called, 'Callback should not have been called yet');
	sched.notify('foo');
	assert(called, 'Callback should have been called');
	done();
    });
    it('should not call a callback unless the condition has been met', function(done){
	var sched = new Scheduler();
	var called = false;
	sched.register(['foo'], function() {
	    called = true;
	});
	assert(!called, 'Callback should not have been called yet');
	sched.notify('bar');
	assert(!called, 'Callback should not have been called');
	done();
    });
    it('should allow multiple registrations on the same condition', function(done){
	var sched = new Scheduler();
	var called1 = false;
	sched.register(['foo'], function() {
	    called1 = true;
	});
	var called2 = false;
	sched.register(['foo'], function() {
	    called2 = true;
	});
	var called3 = false;
	sched.register(['foo'], function() {
	    called3 = true;
	});
	assert(!called1, 'Callback 1 should not have been called yet');
	assert(!called2, 'Callback 2 should not have been called yet');
	assert(!called3, 'Callback 3 should not have been called yet');
	sched.notify('foo');
	assert(called1, 'Callback 1 should have been called');
	assert(called2, 'Callback 1 should have been called');
	assert(called3, 'Callback 1 should have been called');
	done();
    });
    it('should call each callback only once even if notified multiple times', function(done){
	var sched = new Scheduler();
	var called = false;
	sched.register(['foo'], function() {
	    assert(!called, 'Callback should have been called only once');
	    called = true;
	});
	sched.notify('foo');
	sched.notify('foo');
	sched.notify('foo');
	sched.notify('foo');
	done();
    });
    it('should call a callback only when all conditions are met', function(done){
	var sched = new Scheduler();
	var called = false;
	sched.register(['foo', 'bar', 'baz', 'bat'], function() {
	    called = true;
	});
	sched.notify('bar');
	sched.notify('foo');
	sched.notify('bat');
	assert(!called, 'Callback should not have been called yet');
	sched.notify('baz');
	assert(called, 'Callback should have been called');
	done();
    });
});
