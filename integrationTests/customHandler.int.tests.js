var express = require('express');
var setups = require('./setups');
var request = require('supertest');

var chai = require('chai');
var expect = chai.expect;
chai.should();


describe('CUSTOM HANDLER', ()=> {
  describe('when_stratedy_is_successful', ()=> {
    var SUTRequest;
    let app;
    before(() => {
      app = express();
      app.use(setups.customHandlerSuccess(app));
      app.get("/", function (req, res) {
        SUTRequest = req;
        res.send("end");
      });
    });

    it("should_call_customHandler", (done) => {
      request(app)
        .get('/')
        .expect((res)=> {
          SUTRequest.customUser.should.equal('bubba');
        })
        .expect(200, done)
    })
  });

  describe('when_stratedy_is_failure', ()=> {
    var SUTRequest;
    let app;
    before(() => {
      app = express();
      app.use(setups.customHandlerFailure(app));
      app.get("/", function (req, res) {
        SUTRequest = req;
        res.send("end");
      });
    });

    it("should_set_status_to_401_and_return eg no continue on failure path", (done) => {
      request(app)
        .get('/')
        .expect((res)=> {
          expect(res.headers['WWW-Authenticate']).to.be.undefined;
        })
        .expect(401, done)
    })
  });

  describe('when_stratedy_is_error', ()=> {
    var SUTRequest;
    let app;
    before(() => {
      app = express();
      app.use(setups.customHandlerError(app));
      app.get("/", function (req, res) {
        SUTRequest = req;
        res.send("end");
      });
    });

    it("should_put_user_on_request", (done) => {
      request(app)
        .get('/')
        .expect((res)=> {
          SUTRequest.customError.should.equal('custom error');
        })
        .expect(200, done)
    })
  })

});
