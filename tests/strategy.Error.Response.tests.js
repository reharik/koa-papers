
var papers = require('./../src/papers');
var request = require('./helpers/request');
var response = require('./helpers/response');
var strategy = require('./helpers/testStrategy');
var co = require('co');

var chai = require('chai');
var expect = chai.expect;
chai.should();

describe.only('ERROR_RESPONSE', () => {
  describe('when_error_is_called_by_strategy', () => {
    let SUT = undefined;
    let req;
    let res;
    let nextArg;
    let next = (arg)=> {nextArg=arg};
    beforeEach((done) => {
      req = request();
      res = response();
      var myStrategy = strategy({type:'error', details: {error: 'some error'}});
      var config = {
        strategies: [myStrategy]
      };
      SUT = papers().registerMiddleware(config);
      co(function *(){
        ctx = {request:req, response: res, throw: (type, msg, status)=>{res.statusCode = status; res.body = msg} };
        yield SUT.call(ctx, [next]);
        done()
      });
    });

    it('should_call_next_with_error', () => {
      res.body.should.equal('some error')
    });

    it('should_not_call_end', () => {
      res.endWasCalled.should.be.false
    });

  });
});
