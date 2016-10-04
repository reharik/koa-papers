var papers = require('./../src/papers');
var request = require('./helpers/request');
var response = require('./helpers/response');
var strategy = require('./helpers/testStrategy');
var chai = require('chai');
var expect = chai.expect;
chai.should();
var co = require('co');

describe.only('AUTHENTICATION', () => {
  describe('when_calling_middleware', () => {
    let SUT = undefined;
    let req;
    let res;
    let next;
    beforeEach( (done) => {req = request();
      res = response();
      var myStrategy = strategy({type:'pass'});
      var config = {
        strategies:[myStrategy],
        serializers:[()=>{}],
        deserializers:[()=>{}]
      };

      SUT = papers().registerMiddleware(config);
      co(function *(){
        var ctx = {request:req, response: res};
        yield SUT.call(ctx, [next]);
        done()
      })

    });

    it('should_put_methods_on_req', () => {
      req.logOut.should.be.function;
      req.isAuthenticated .should.be.function;
    })
  });

  describe('when_calling_middleware_with_session_for_first_time', () => {
    let SUT = undefined;
    let req;
    let res;
    let next;
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy({type:'pass'});
      var config = {
        strategies:[myStrategy],
        serializers:[()=>{}],
        deserializers:[()=>{}],
        useSession: true
      };
      SUT = papers().registerMiddleware(config);

      co(function *(){
        var ctx = {request:req, response: res, session: {}};
        yield SUT.call(ctx, [next]);
        done()
      })
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
    let next = ()=>{}
    beforeEach((done) => {
      user = { name: 'bubba' };
      req = request();
      res = response();
      var myStrategy = strategy({type:'pass'});
      var config = {
        strategies:[myStrategy],
        serializers:[()=>{ Promise.resolve()}],
        deserializers:[(user)=>{return user;}],
        useSession: true
      };
      SUT = papers().registerMiddleware(config);

      co(function *(){
        var ctx = {request:req, response: res, session: {'papers':{user}}};
        yield SUT.call(ctx, [next]);
        done()
      })
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
    let next = ()=>{};
    var ctx;
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

      co(function *(){
        ctx = {request:req, response: res, session: {'papers':{user}}};
        yield SUT.call(ctx, [next]);
        done()
      })
    });

    it('should_remove_user_from_session', () => {
      expect(ctx.session.papers.user).to.be.undefined;
    })
  });

  describe('when_calling_middleware_with_session_but_deserialize_throws', () => {
    let SUT;
    let req;
    let res;
    let user;
    let next = ()=>{};
    var ctx;
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

      co(function *(){
        ctx = {request:req, response: res, session: {'papers':{user}}};
        yield SUT.call(ctx, [next]);
        done()
      })
    });

    it('should_return_500_with_the_error', () => {
      res.body.should.contain('Error thrown during deserialization of user.')
    })
  });

});
