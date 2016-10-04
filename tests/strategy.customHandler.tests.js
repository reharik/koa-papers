var papers = require('./../src/papers');
var request = require('./helpers/request');
var response = require('./helpers/response');
var strategy = require('./helpers/testStrategy');
var chai = require('chai');
var expect = chai.expect;
chai.should();

describe('CUSTOM_HANDLER', () => {
  describe('when_fail_is_called_with_customHander', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    let customHandlerArg;
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy( {type: 'fail', details: {error:'failed auth'}});
      var config = {
        strategies: [myStrategy],
        customHandler: (req,res,next,result) => {
          customHandlerArg = result;
        }
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res, ()=> {nextArg='next called'});
      setTimeout(done,10);
    });

    it('should_pass_result_to_handler', () => {
      customHandlerArg.should.eql({type:'fail', details: { errorMessage:'failed auth', statusCode:'Unauthorized'}});
    });

    it('should_not_call_next', () => {
      expect(nextArg).to.be.undefined;
    });

    it('should_call_res.end', () => {
      res.endWasCalled.should.be.false
    });
  });

  describe('when_error_is_called_with_customHander', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    let customHandlerArg;
    let standardizedResult = { errorMessage:'some error', statusCode:500, exception:'some error'};
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy( {type: 'error', details: {error:'some error'}});
      var config = {
        strategies: [myStrategy],
        customHandler: (req,res,next,result) => {
          customHandlerArg = result;
        }
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res, (arg)=> {nextArg=arg});
      setTimeout(done,10);
    });

    it('should_pass_result_to_handler', () => {
      customHandlerArg.should.eql(standardizedResult);
    });

    it('should_not_call_next', () => {
      expect(nextArg).to.be.undefined;
    });

    it('should_not_call_res.end', () => {
      res.endWasCalled.should.be.false
    });
  });

  describe('when_success_is_called_with_customHander', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    let customHandlerArg;
    let user;
    let result;
    beforeEach((done) => {
      req = request();
      res = response();
      user = {name: 'bubba'};
      result = {type: 'success', details: {user}};
      var myStrategy = strategy(result);
      var config = {
        strategies: [myStrategy],
        customHandler: (req,res,next,result) => {
          customHandlerArg = result;
        }
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res, (arg)=> {nextArg='next called'});
      setTimeout(done,10);
    });

    it('should_pass_result_to_handler', () => {
      customHandlerArg.should.eql(result);
    });

    it('should_not_call_next', () => {
      expect(nextArg).to.be.undefined;
    });

    it('should_not_call_res.end', () => {
      res.endWasCalled.should.be.false
    });
  });
});