var express = require('express');
var setups = require('./setups');
var request = require('supertest');

var chai = require('chai');
var expect = chai.expect;
chai.should();


describe('PASS', ()=> {
  describe('when_stratedy_returns_a_pass', ()=> {
    var SUTRequest;
    let app;
    before(() => {
      app = express();
      app.use(setups.pass(app));
      app.get("/", function (req, res) {
        SUTRequest = req;
        res.send("end");
      });
    });

    it("should_error_on_response_and_401", (done) => {
      request(app)
        .get('/')
        .expect("WWW-Authenticate", 'No successful login strategy found')
        .expect(401, done)
    })
  })
});
