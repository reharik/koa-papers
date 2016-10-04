const http = require('_http_server');
const co = require('co');
const handleFailurePostIteration = require('./handleFailurePostIteration');
const handleSuccess = require('./handleSuccess');
const handleError = require('./handleError');
const standardizeErrors = require('./standardizeErrors');

const redirect = require('./redirect');
const checkSessionForAuth = require('./checkSessionForAuth');


module.exports = (papers) => {

  return function *(next) {

    /********* check session for auth *************/
    const checkSession = (res, req, ctx, papers) =>  {
      return co(function *checkSessionGen() {
        return yield checkSessionForAuth(papers, ctx);
      }).catch(ex => {
        console.log('==========ex=========');
        console.log(ex);
        console.log('==========END ex=========');
        res.status = 500;
        res.body = `${http.STATUS_CODES[500]} \n ${ex.message} \n ${ex}`;
      })
    };

    /********* iterate strategies *************/
    const iterateStrategies = (res, req, papers) => {
      return co(function *iterateStrategies() {
        let failures = [];

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
    };

    let req = this.request;
    let res = this.response;
    let ctx = this;
    
    /********* add convenience methods to req *************/
    req.logOut = papers.functions.logOut(req, papers.options.userProperty, papers.options.key);
    req.isAuthenticated = papers.functions.isAuthenticated(req);

    const hasSession = yield checkSession(res, req, ctx, papers);
    // this is strange logic but necessary to handle hasSession throwing
    let result = hasSession && !hasSession.isLoggedIn
      ? yield iterateStrategies(res, req, papers)
      : {type: 'session'};

    switch (result.type) {
      case 'customHandler':
      {
        papers.functions.customHandler(req, res, next, result.value);
        return;
      }
      case 'error':
      {
        ctx.throw('error', result.value.exception, 500);
        break;
      }
      case 'failWithError':
      {
        ctx.throw('error', result.value, 500);
        break;
      }
      case 'success':
      {
        yield next;
        break;
      }
      default:
      {
        res.body = res.body || http.STATUS_CODES[res.status];
        return;
      }
    }
  };
};