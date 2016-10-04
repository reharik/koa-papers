const http = require('_http_server');
const co = require('co');
const handleFailurePostIteration = require('./handleFailurePostIteration');
const handleSuccess = require('./handleSuccess');
const handleError = require('./handleError');
const standardizeErrors = require('./standardizeErrors');

const redirect = require('./redirect');
const checkSessionForAuth = require('./checkSessionForAuth');


module.exports = createAuthenticationMiddleware = (papers) => {

  const authenticationMiddleware = function *(req, res, next, ctx) {
    ctx = ctx || req;
    /********* add convenience methods to req *************/
    req.logOut = papers.functions.logOut(req, papers.options.userProperty, papers.options.key);
    req.isAuthenticated = papers.functions.isAuthenticated(req);

    /********* check session for auth *************/

    var checkSession = yield co(function *checkSessionGen() {
      return yield checkSessionForAuth(papers, ctx);
    }).catch(ex => {
        console.log('==========ex=========');
        console.log(ex);
        console.log('==========END ex=========');
        res.status= 500;
        res.body = `${http.STATUS_CODES[500]} \n ${ex.message} \n ${ex}`;
    });

    if (checkSession.isLoggedIn) {
      return {type: 'session'};
    }

    yield result = co(function *iterateStrategies() {

      const checkSession = yield checkSessionForAuth(papers, ctx);
      if(checkSession.isLoggedIn) {
        return {type:'session'};
      }

      let failures = [];

      /********* iterate strategies *************/
      for (let strategy of papers.functions.strategies) {

        if (!strategy) {
          continue;
        }

        const stratResult = strategy.authenticate(req, papers);
        if (!stratResult || !stratResult.type) {
          continue
        }

        switch (stratResult.type) {
          case 'fail':
          {
            failures.push(standardizeErrors(stratResult));
            break;
          }
          case 'redirect':
          {
            return {type: 'redirect', value: redirect(res, stratResult.details.url, stratResult.details.statusCode)};
          }
          case 'error':
          {
            return handleError(stratResult, papers);
          }
          case 'success':
          {
            return handleSuccess(stratResult, req, res, papers);
          }
        }
      }
      return handleFailurePostIteration(failures, res, papers);
    }).catch(ex => {
      console.log('==========ex=========');
      console.log(ex);
      console.log('==========END ex=========');
      res.status = 500;
      res.body = `${http.STATUS_CODES[500]} \n ${ex.message} \n ${ex}`;
    });

    switch(result.type) {
      case 'customHandler': {
        papers.functions.customHandler(req, res, next, result.value);
        return;
      }
      case 'error': {
        ctx.throw('error', result.value.exception ,500);
        break;
      }
      case 'failWithError': {
        ctx.throw('error', result.value,500);
        break;
      }
      case 'success': {
        yield next;
      }
      default:{
        res.body = http.STATUS_CODES[res.status];
        return;
      }
    }
  };

  // I feel like this should be in a separate module but I need the closure for papers
  if(papers.options.koa === true) {
    return function *(next) {
      yield authenticationMiddleware(this.request, this.response, next, this);
    }
  } else {
    return authenticationMiddleware;
  }
};