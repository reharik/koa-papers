var papers = require('./../src/papers');
var request = require('./helpers/request');
var response = require('./helpers/response');
var strategy = require('./helpers/testStrategy');
var chai = require('chai');
var expect = chai.expect;
chai.should();

describe('NO_RESPONSE', () => {
  describe('when_no_strategy_is_successful_and_no_specific_errors', () => {
    let SUT = undefined;
    let req;
    let res;
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy();
      var config = {
        strategies: [myStrategy]
      };
      SUT = papers().registerMiddleware(config);

      SUT(req, res);
      setTimeout(done,10);
    });

    it('should_set_res_status_to_401', () => {
      res.statusCode.should.equal(401);
    });

    it('should_set_res_header_WWWW-Authenticate_to_error_message', () => {
      res.getHeader('WWW-Authenticate')[0].should.equal('No successful login strategy found');
    });

    it('should_call_res.end', () => {
      res.endWasCalled.should.be.true
    });

  });

  describe('when_no_strategy_is_successful_and_no_specific_errors_and_fail_with_error', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy();
      var config = {
        strategies: [myStrategy],
        failWithError: true
      };
      var next = (arg) => {
        nextArg = arg;
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res, next);
      setTimeout(done,10);
    });

    it('should_call_next_with_proper_arg', () => {
      nextArg.should.be.a('Error');
    });

    it('should_call_next_poper_error_message', () => {
      nextArg.message.should.equal('Unauthorized');
    });

    it('should_set_res_header_WWWW-Authenticate_to_error_message', () => {
      res.getHeader('WWW-Authenticate')[0].should.equal('No successful login strategy found');
    });
  });

  describe('when_no_strategy_is_successful_and_no_specific_errors_and_failureRedirect', () => {
    let SUT = undefined;
    let req;
    let res;
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy();
      var config = {
        strategies: [myStrategy],
        failureRedirect: 'some.url'
      };
      
      SUT = papers().registerMiddleware(config);
      SUT(req, res);
      setTimeout(done,10);
    });

    it('should_call_next_with_proper_arg', () => {
      res.statusCode.should.equal(302);
    });

    it('should_put_proper_url_on_location_header', () => {
      res.getHeader('Location').should.equal('some.url');
    });

    it('should_set_content-length_to_0', () => {
      res.getHeader('Content-Length').should.equal('0');
    });

    it('should_set_res_header_WWWW-Authenticate_to_error_message', () => {
      res.getHeader('WWW-Authenticate')[0].should.equal('No successful login strategy found');
    });

    it('should_call_res.end', () => {
      res.endWasCalled.should.be.true
    });
  });


});