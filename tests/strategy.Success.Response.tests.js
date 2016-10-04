
var papers = require('./../src/papers');
var request = require('./helpers/request');
var response = require('./helpers/response');
var strategy = require('./helpers/testStrategy');
var chai = require('chai');
var expect = chai.expect;
chai.should();

describe('SUCCESS_RESPONSE', () => {
  describe('when_success_is_called_by_strategy', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    let user;
    beforeEach((done) => {
      req = request();
      res = response();
      var next = (arg) => {
        nextArg = 'calledNext';
      };
      user = {name: 'bubba'}
      var myStrategy = strategy({type:'success', details: {user}});
      var config = {
        strategies: [myStrategy]
      };
      SUT = papers().registerMiddleware(config);
      SUT(req, res, next);
      setTimeout(done,10);
    });

    it('should_put_user_on_req', () => {
      req.user.should.eql(user)
    });

    it('should_call_next', () => {
      nextArg.should.eql('calledNext')
    });
  });

  describe('when_success_is_called_by_strategy_with_session', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    let user;
    beforeEach((done) => {
      req = request();
      res = response();
      var next = (arg) => {
        nextArg = 'calledNext';
      };
      user = {name: 'bubba'}
      var myStrategy = strategy({type:'success', details: {user}});
      var config = {
        strategies: [myStrategy],
        serializers: [(user)=>{user.serialized=true; return user}]
      };
      req.session = {papers: {}}

      SUT = papers().registerMiddleware(config);
      SUT(req, res, next);
      setTimeout(done,10);
    });

    it('should_put_user_on_req', () => {
      req.user.should.eql(user)
    });

    it('should_put_user_in_papers_session', () => {
      req.session.papers.user.serialized.should.be.true;
    });

    it('should_call_next', () => {
      nextArg.should.eql('calledNext')
    });
  });

  describe('when_success_is_called_by_strategy_with_session_with_returnTo', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    let user;
    beforeEach((done) => {
      req = request();
      res = response();
      var next = (arg) => {
        nextArg = 'calledNext';
      };
      user = {name: 'bubba'}
      var myStrategy = strategy({type:'success', details: {user}});
      var config = {
        strategies: [myStrategy],
        serializers: [(user)=>{user.serialized=true; return user}]
      };
      req.session = {returnTo: 'some.url', papers: {}}

      SUT = papers().registerMiddleware(config);
      SUT(req, res, next);
      setTimeout(done,10);
    });

    it('should_put_user_on_req', () => {
      req.user.should.eql(user)
    });

    it('should_put_user_in_papers_session', () => {
      req.session.papers.user.serialized.should.be.true;
    });

    it('should_delete_url_from_session', () => {
      expect(req.session.returnTo).to.be.undefined;
    });

    it('should_redirect_to_said_url', () => {
      res.statusCode.should.equal(200);
      res.getHeader('Location').should.equal('some.url');
      res.getHeader('Content-Length').should.equal('0');
      res.endWasCalled.should.be.true
    });

    it('should_call_end', () => {
      res.endWasCalled.should.be.true;
    });
  });

  describe('when_success_is_called_by_strategy_with_session_with_successRedirect', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    let user;
    beforeEach((done) => {
      req = request();
      res = response();
      var next = (arg) => {
        nextArg = 'calledNext';
      };
      user = {name: 'bubba'}
      var myStrategy = strategy({type:'success', details: {user}});
      var config = {
        successRedirect: "a.great.url",
        strategies: [myStrategy],
        serializers: [(user)=>{user.serialized=true; return user}]
      };
      req.session = {papers: {}}

      SUT = papers().registerMiddleware(config);
      SUT(req, res, next);
      setTimeout(done,10);
    });

    it('should_put_user_on_req', () => {
      req.user.should.eql(user)
    });

    it('should_redirect_to_said_url', () => {
      res.statusCode.should.equal(200);
      res.getHeader('Location').should.equal('a.great.url');
      res.getHeader('Content-Length').should.equal('0');
      res.endWasCalled.should.be.true
    });

    it('should_call_end', () => {
      res.endWasCalled.should.be.true;
    });
  });

  describe('when_success_is_called_by_strategy_with_session_returnTo_and_successRedirect', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    let user;
    beforeEach((done) => {
      req = request();
      res = response();
      var next = (arg) => {
        nextArg = 'calledNext';
      };
      user = {name: 'bubba'}
      var myStrategy = strategy({type:'success', details: {user}});
      var config = {
        successRedirect: "a.great.url",
        strategies: [myStrategy],
        serializers: [(user)=>{user.serialized=true; return user}]
      };
      req.session = {returnTo: 'some.url', papers: {}}

      SUT = papers().registerMiddleware(config);
      SUT(req, res, next);
      setTimeout(done,10);
    });

    it('should_allow_return_to_to_take_precedence', () => {
      res.getHeader('Location').should.equal('some.url');
    });

  });
});
