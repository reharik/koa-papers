var papers = require('./../src/papers');
var request = require('./helpers/request');
var response = require('./helpers/response');
var strategy = require('./helpers/testStrategy');
var chai = require('chai');
var expect = chai.expect;
chai.should();
 
describe('MULTIPLE_SUCCESS_RESPONSES', () => {
  describe('when_multiple_strategies_would_call_success', () => {
    let SUT = undefined;
    let req;
    let res;
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy({type:'success', details:{user:{name:'frank'}}});
      var myStrategy1 = strategy({type:'success', details:{user:{name:'frank1'}}});
      var myStrategy2 = strategy({type:'success', details:{user:{name:'frank2'}}});
      //this one shows that it didn't process all the strats, just the first
      var myStrategy3 = strategy({type:'error', details:{error:'something went wrong!1', status:500}});
      var config = {
        strategies: [myStrategy, myStrategy1, myStrategy2, myStrategy3]
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res, ()=>{});
      setTimeout(done,10);
    });

    it('should_set_res_status_to_200', () => {
      res.statusCode.should.equal(200);
    });

    it('should_put_first_success_on_req_and_not_process_others', () => {
      req.user.name.should.equal('frank');
      req.user.name.should.not.equal('frank1');
    });
  });

  describe('when_fail_is_called_and_then_success', () => {
    let SUT = undefined;
    let req;
    let res;
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy({type:'fail', details:{error:'something went wrong!', status:402}});
      var myStrategy1 = strategy({type:'fail', details:{error:'something went wrong!1', status:500}});
      var myStrategy2 = strategy({type:'success', details:{user:{name:'frank2'}}});
      var config = {
        strategies: [myStrategy, myStrategy1, myStrategy2]
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res, ()=>{});
      setTimeout(done,10);
    });

    it('should_set_res_status_to_200', () => {
      res.statusCode.should.equal(200);
    });

    it('should_put_first_success_on_req', () => {
      req.user.name.should.equal('frank2');
    });

    it('should_not_set_res_header_WWWW-Authenticate', () => {
      expect(res.getHeader('WWW-Authenticate')).to.be.undefined;
    });
  });

  describe('when_one_more_for_good_measure', () => {
    let SUT = undefined;
    let req;
    let res;
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy({type:'pass'});
      var myStrategy1 = strategy({type:'fail', details:{error:'something went wrong!1', status:500}});
      var myStrategy2 = strategy({type:'pass'});
      var myStrategy3 = strategy({type:'success', details:{user:{name:'frank2'}}});
      var config = {
        strategies: [myStrategy, myStrategy1, myStrategy2, myStrategy3]
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res, ()=>{});
      setTimeout(done,10);
    });

    it('should_set_res_status_to_200', () => {
      res.statusCode.should.equal(200);
    });

    it('should_put_first_success_on_req', () => {
      req.user.name.should.equal('frank2');
    });

    it('should_not_set_res_header_WWWW-Authenticate', () => {
      expect(res.getHeader('WWW-Authenticate')).to.be.undefined;
    });
  });


});