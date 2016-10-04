
var papers = require('./../src/papers');
var request = require('./helpers/request');
var response = require('./helpers/response');
var strategy = require('./helpers/testStrategy');
var chai = require('chai');
var expect = chai.expect;
chai.should();

describe('ERROR_RESPONSE', () => {
  describe('when_error_is_called_by_strategy', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    beforeEach((done) => {
      req = request();
      res = response();
      var next = (arg) => {
        nextArg = arg;
      };
      var myStrategy = strategy({type:'error', details: {error: 'some error'}});
      var config = {
        strategies: [myStrategy]
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res, next);
      setTimeout(done,0);
    });

    it('should_call_next_with_error', () => {
      console.log('==========nextArg=========');
      console.log(nextArg);
      console.log('==========END nextArg=========');
      nextArg.should.equal('some error')
    });

    it('should_not_call_end', () => {
      res.endWasCalled.should.be.false
    });

  });
});
