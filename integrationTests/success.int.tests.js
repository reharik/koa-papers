var express = require('express');
var setups = require('./setups');
var request = require('supertest');

var chai = require('chai');
var expect = chai.expect;
chai.should();


describe('SUCCESS', ()=> {
  describe('when_stratedy_is_successful', ()=> {
    var SUTRequest;
    let app;
    before(() => {
      app = express();
      app.use(setups.basicSuccess(app));
      app.get("/", function (req, res) {
        SUTRequest = req;
        res.send("end");
      });
    });

    it("should_put_user_on_request", (done) => {
      request(app)
        .get('/')
        .expect((res)=> {
          SUTRequest.user.name.should.equal('bubba');
        })
        .expect(200, done)
    })
  })

});
