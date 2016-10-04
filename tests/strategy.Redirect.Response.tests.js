var papers = require('./../src/papers');
var request = require('./helpers/request');
var response = require('./helpers/response');
var strategy = require('./helpers/testStrategy');
var chai = require('chai');
var expect = chai.expect;
chai.should();

//TODO tests around the schema returned by strat

describe('REDIRECT_RESPONSE', () => {
  describe('when_redirect_is_called_by_strategy', () => {
    let SUT = undefined;
    let req;
    let res;
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy({type:'redirect', details:{ url: 'some.url', status: 302}});
      var config = {
        strategies: [myStrategy]
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res);
      setTimeout(done,10);

    });

    it('should_set_res_status_to_302', () => {
      res.statusCode.should.equal(302);
    });

    it('should_put_proper_url_on_location_header', () => {
      res.getHeader('Location').should.equal('some.url');
    });

    it('should_set_content-length_to_0', () => {
      res.getHeader('Content-Length').should.equal('0');
    });

    it('should_call_res.end', () => {
      res.endWasCalled.should.be.true
    });

  });

});