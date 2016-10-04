var papers = require('./../src/papers');
var request = require('./helpers/request');
var response = require('./helpers/response');
var strategy = require('./helpers/testStrategy');
var chai = require('chai');
var expect = chai.expect;
chai.should();

describe.only('AUTHENTICATION', () => {
  describe('when_calling_middleware', () => {
    let SUT = undefined;
    let req;
    let res;
    let next;
    beforeEach(() => {
      req = request();
      res = response();
      var myStrategy = strategy({type:'pass'});
      var config = {
        strategies:[myStrategy],
        serializers:[()=>{}],
        deserializers:[()=>{}]
      };
      SUT = papers().registerMiddleware(config);

      SUT(next);
    });

    it('should_put_methods_on_req', () => {
      SUT.req.logOut.should.be.function;
      req.isAuthenticated .should.be.function;
    })
  });

  describe('when_calling_middleware_with_session_for_first_time', () => {
    let SUT = undefined;
    let req;
    let res;
    beforeEach(() => {
      req = request({});
      res = response();
      var myStrategy = strategy({type:'pass'});
      var config = {
        strategies:[myStrategy],
        serializers:[()=>{}],
        deserializers:[()=>{}],
        useSession: true
      };
      SUT = papers().registerMiddleware(config);

      SUT(req, res);
    });

    it('should_not_put_user_on_res', () => {
      expect(res.user).to.be.undefined;
    })
  })

  describe('when_calling_middleware_with_session_after_auth', () => {
    let SUT;
    let req;
    let res;
    let user;
    beforeEach((done) => {
      user = { name: 'bubba' };
      req = request({'papers':{user}});
      res = response();
      var myStrategy = strategy({type:'pass'});
      var config = {
        strategies:[myStrategy],
        serializers:[()=>{ Promise.resolve()}],
        deserializers:[(user)=>{return user;}],
        useSession: true
      };
      SUT = papers().registerMiddleware(config);

      SUT(req, res, ()=>{});
      setTimeout(done,10);
    });

    it('should_put_user_on_res', () => {
      req.user.should.eql(user);
    })
  });

  describe('when_calling_middleware_with_session_after_auth_but_bad_deserialize', () => {
    let SUT;
    let req;
    let res;
    let user;
    beforeEach((done) => {
      user = { name: 'bubba' };
      req = request({'papers':{user}});
      res = response();
      var myStrategy = strategy({type:'pass'});
      var config = {
        strategies:[myStrategy],
        serializers:[()=>{}],
        deserializers:[(user)=>{}],
        useSession: true
      };
      SUT = papers().registerMiddleware(config);

      SUT(req, res, ()=>{});
      setTimeout(done,10);
    });

    it('should_remove_user_from_session', () => {
      expect(req.session.papers.user).to.be.undefined;
    })
  });

  describe('when_calling_middleware_with_session_but_deserialize_throws', () => {
    let SUT;
    let req;
    let res;
    let user;
    beforeEach((done) => {
      user = { name: 'bubba' };
      req = request({'papers':{user}});
      res = response();
      var myStrategy = strategy({type:'pass'});
      var config = {
        strategies:[myStrategy],
        serializers:[()=>{}],
        deserializers:[(user)=>{throw new Error()}],
        useSession: true
      };
      SUT = papers().registerMiddleware(config);
      result = SUT(req, res, ()=>{});
      setTimeout(done,10);
    });

    it('should_return_500_with_the_error', () => {
      res.body.should.contain('Error thrown during deserialization of user.')
    })
  });

});
