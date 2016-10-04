var papers = require('./../src/papers');
var request = require('./helpers/request');
var response = require('./helpers/response');
var strategy = require('./helpers/testStrategy');
var chai = require('chai');
var expect = chai.expect;
chai.should();

describe('MULTIPLE_FAIL_RESPONSES', () => {
  describe('when_fail_is_called_by_multip_strategies', () => {
    let SUT = undefined;
    let req;
    let res;
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy({type:'fail', details:{error:'something went wrong!'}});
      var myStrategy1 = strategy({type:'fail', details:{error:'something went wrong!1'}});
      var myStrategy2 = strategy({type:'fail', details:{error:'something went wrong!2'}});
      var config = {
        strategies: [myStrategy, myStrategy1, myStrategy2]
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res);
      setTimeout(done,10);
    });

    it('should_set_res_status_to_401', () => {
      res.statusCode.should.equal(401);
    });

    it('should_set_res_header_WWWW-Authenticate_to_error_message', () => {
      res.getHeader('WWW-Authenticate').length.should.equal(3);
      res.getHeader('WWW-Authenticate')[0].should.equal('something went wrong!');
    });

    it('should_call_strategies_in_correct_order', () => {
      res.getHeader('WWW-Authenticate')[0].should.equal('something went wrong!');
      res.getHeader('WWW-Authenticate')[1].should.equal('something went wrong!1');
      res.getHeader('WWW-Authenticate')[2].should.equal('something went wrong!2');
    });

    it('should_call_res.end', () => {
      res.endWasCalled.should.be.true
    });
  });

  describe('when_fail_is_called_by_strategy_and_fail_with_error_specified', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy({type:'fail', details:{error:'something went wrong!', statusCode:402}});
      var myStrategy1 = strategy({type:'fail', details:{error:'something went wrong!1', statusCode:500}});
      var myStrategy2 = strategy({type:'fail', details:{error:'something went wrong!2', statusCode:502}});
      var config = {
        strategies: [myStrategy, myStrategy1, myStrategy2],
        failWithError: true
      };
      var next = (arg) => {
        nextArg = arg;
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res, next);
      setTimeout(done,10);
    });

    it('should_call_next_on_with_highest_status', () => {
      nextArg.message.should.equal('Bad Gateway');
    });

    it('should_not_set_res_header_WWWW-Authenticate_when_error_is_greater_than_401', () => {
      expect(res.getHeader('WWW-Authenticate')).to.be.undefined;
    });
  });
});