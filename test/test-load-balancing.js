
var should     = require('should'),
    util       = require('util'),
    Sequence   = require('../lib/gearmanode/load-balancing').Sequence,
    RoundRobin = require('../lib/gearmanode/load-balancing').RoundRobin;


describe('load-balancing', function() {
    var lb;
    beforeEach(function() {
        lb = new Sequence(2);
    });


    describe('#LBStrategy', function() {


        describe('#constructor', function() {
            it('should return error when violated validation', function() {
                // duplicate servers
                lb = new Sequence();
                lb.should.be.an.instanceof(Error);
                lb = new Sequence('foo');
                lb.should.be.an.instanceof(Error);
                lb = new RoundRobin();
                lb.should.be.an.instanceof(Error);
                lb = new RoundRobin('foo');
                lb.should.be.an.instanceof(Error);
            })
        })


        describe('#badOne', function() {
            it('should store given index with timestamp', function() {
                Object.keys(lb.badNodes).length.should.equal(0);
                lb.badOne(1);
                Object.keys(lb.badNodes).length.should.equal(1);
                lb.badNodes.should.have.ownProperty(1);
                lb.badNodes[1].should.be.an.instanceof(Date);
                (new Date >= lb.badNodes[1]).should.be.true;
            })
            it('should ignore index bigger than node count', function() {
                Object.keys(lb.badNodes).length.should.equal(0);
                lb.badOne(2);
                Object.keys(lb.badNodes).length.should.equal(0);
            })
            it('should accept only number', function() {
                Object.keys(lb.badNodes).length.should.equal(0);
                lb.badOne('0');
                Object.keys(lb.badNodes).length.should.equal(0);
                lb.badOne(null);
                Object.keys(lb.badNodes).length.should.equal(0);
                lb.badOne(false);
                Object.keys(lb.badNodes).length.should.equal(0);
            })
        })
    })


    describe('#Sequence', function() {


        describe('#nextIndex', function() {
            it('should return corresponding index if everything OK', function() {
                lb.nextIndex().should.equal(0);
                lb.nextIndex().should.equal(0);
                lb.nextIndex().should.equal(0);
            })
            it('should return next index if the current fails', function() {
                lb.badOne(0);
                lb.nextIndex().should.equal(1);
                lb.nextIndex().should.equal(1);
            })
            it('should return null if all nodes fails', function() {
                lb.nextIndex().should.equal(0);
                lb.badOne(0);
                lb.badOne(1);
                should.not.exist(lb.nextIndex());
            })
        })

    })


    describe('#RoundRobin', function() {


        describe('#nextIndex', function() {
            it('should return corresponding index if everything OK', function() {
                lb = new RoundRobin(2);
                lb.nextIndex().should.equal(0);
                lb.nextIndex().should.equal(1);
                lb.nextIndex().should.equal(0);
                lb.nextIndex().should.equal(1);
            })
            it('should return next index if the current fails', function() {
                lb = new RoundRobin(2);
                lb.badOne(0);
                lb.nextIndex().should.equal(1);
                lb.nextIndex().should.equal(1);
            })
            it('should return null if all nodes fails', function() {
                lb = new RoundRobin(2);
                lb.nextIndex().should.equal(0);
                lb.badOne(0);
                lb.badOne(1);
                should.not.exist(lb.nextIndex());
            })
        })

    })


    describe('#recoverTime', function() {
        it('should try failed nodes again after recover time', function(node) {
            lb.recoverTime = 20;
            lb.badOne(0);
            lb.badOne(1);
            Object.keys(lb.badNodes).length.should.equal(2);
            lb.badNodes.hasOwnProperty(0).should.be.true;
            lb.badNodes.hasOwnProperty(1).should.be.true;
            should.not.exist(lb.nextIndex());
            setTimeout(function() {
                lb.badNodes.hasOwnProperty(0).should.be.true;
                lb.badNodes.hasOwnProperty(1).should.be.true;
                lb.nextIndex();
                Object.keys(lb.badNodes).length.should.equal(0);
                lb.badNodes.hasOwnProperty(0).should.be.false;
                lb.badNodes.hasOwnProperty(1).should.be.false;
                node();
            }, 30);
        })
    })

})