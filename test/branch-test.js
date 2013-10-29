var util = require('../util.js');
var assert = require('assert');

module.exports = function(branch) {
    describe('as Branch', function(){
	beforeEach(function(done) {
	    branch.reset('root', done);
	});
	describe('checkedUpdate', function(){
	    it('should update the branch state if given that the state condition is met', function(done){
		util.seq([
		    function(_) { branch.checkedUpdate('root', 's1', _); },
		    function(_) { branch.tip(_.to('tip')); },
		    function(_) { assert.equal(this.tip, 's1'); _(); },
		], done)();
	    });
	    it('should return the tip state before modification', function(done){
		util.seq([
		    function(_) { branch.checkedUpdate('root', 's1', _.to('shouldBeRoot')); },
		    function(_) { assert.equal(this.shouldBeRoot, 'root'); _(); },
		    function(_) { branch.tip(_.to('tip')); },
		    function(_) { assert.equal(this.tip, 's1'); _(); },
		], done)();
	    });

	    it('should not update the branch state if the first argument does not match the current tip value', function(done){
		util.seq([
		    function(_) { branch.checkedUpdate('foo', 's1', _); },
		    function(_) { branch.tip(_.to('tip')); },
		    function(_) { assert.equal(this.tip, 'root'); _(); },
		], done)();
	    });

	});
    });
};