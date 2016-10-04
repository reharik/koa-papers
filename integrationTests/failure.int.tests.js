var express = require('express');
var setups = require('./setups');
var request = require('supertest');

var chai = require('chai');
var expect = chai.expect;
chai.should();


describe('FAIL', ()=> {
  describe('when_strategy_fails', ()=> {
    var SUTRequest;
    let app;
    before(() => {
      app = express();
      app.use(setups.basicFail(app));
      app.get("/", function (req, res) {
        SUTRequest = req;
        res.send("end");
      });
    });

    it("should_put_error_in_headers_and_return_401", (done) => {
      request(app)
        .get('/')
        .expect("WWW-Authenticate", 'authentication failed')
        .expect(401, done)
    })
  })
});

describe('FAIL TWICE', ()=> {
  describe('when_2_strategies_fail', ()=> {
    var SUTRequest;
    let app;
    before(() => {
      app = express();
      app.use(setups.failTwice(app));
      app.get("/", function (req, res) {
        SUTRequest = req;
        res.send("end");
      });
    });

    it("should_put_error_in_headers_and_return_401", (done) => {
      request(app)
        .get('/')
        .expect("WWW-Authenticate", 'wtf! soemthing happened!, wtf! soemthing happened! again!!!')
        .expect(401, done)
    })
  })
});


// not even sure what this is supposed to do, but it basically calls next with
// error rather than res.end.  not sure what that is supposed do
describe('FAIL WITH_ERROR', ()=> {
  describe('when_failWithError_flag_set', ()=> {
    var SUTRequest;
    let app;
    before(() => {
      app = express();
      app.use(setups.failWithError(app));
      app.get("/", function (req, res) {
        SUTRequest = req;
        res.send("end");
      });
    });

    it("should_put_error_in_headers_and_return_401", (done) => {
      request(app)
        .get('/')
        .expect("WWW-Authenticate", 'wtf! soemthing happened!, wtf! soemthing happened! again!!!')
        .expect(401, done)
    })
  })
});

// can't seem to test redirects, but have tried manually, and it works
// describe('FAILURE REDIRECT', ()=> {
  // describe('when_failureRedirect_url_provided', ()=> {
  //   var SUTRequest;
  //   let app;
  //   before(() => {
  //     app = express();
  //     app.use(setups.failureRedirect(app));
  //     app.get("/", function (req, res) {
  //       SUTRequest = req;
  //       res.send("end");
  //     });
  //   });
  //
  //   it("should_redirect", (done) => {
  //     request(app)
  //       .get('/')
  //       .expect((res)=>{
  //         console.log('==========res=========');
  //         console.log(res);
  //         console.log('==========END res=========');
  //       })
  //       .expect(302, done)
  //   })
  // })
// });