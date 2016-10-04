var express = require('express');
var setups = require('./setups');
var request = require('supertest');

var chai = require('chai');
var expect = chai.expect;
chai.should();


describe('ERROR', ()=> {
  describe('when_stratedy_returns_an_error', ()=> {
    var SUTRequest;
    let app;
    before(() => {
      app = express();
      app.use(setups.error(app));
      app.get("/", function (req, res) {
        SUTRequest = req;
        res.send("end");
      });
    });

    it("should_error_on_response_and_401", (done) => {
      request(app)
        .get('/')
        .expect( (res)=> {
          res.text.should.contain('wtf! soemthing happened!')})
        .expect(500, done)
    })
  })
});
