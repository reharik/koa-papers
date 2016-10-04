const http = require('_http_server');
const redirect = require('./redirect');


module.exports = (failures, res, papers) => {
  if (failures.length <= 0) {
    failures.push({errorMessage: "No successful login strategy found", statusCode: 401})
  }

  var errorMessages = failures.filter(failure => failure
      && failure.errorMessage
      && typeof failure.errorMessage === 'string')
    .map(failure => failure.errorMessage);

  res.status = failures.map(f => f.statusCode)
    .reduce((prev, curr) => prev < curr ? curr : prev, 401);

  if (papers.functions.customHandler) {
    return {
      type: 'customHandler',
      result: 'fail',
      value: {
        type: 'fail',
        details: {errorMessage: errorMessages[0], statusCode: http.STATUS_CODES[res.statusCode]}
      }
    };
  }

  if (res.status == 401 && errorMessages.length) {
    res.setHeader('WWW-Authenticate', errorMessages);
  }
  
  if (papers.options.failWithError) {
    return {type: 'failWithError', value: new Error(http.STATUS_CODES[res.status])};
  }
  const redirectOnFailureUrl = papers.options.failureRedirect;
  if (redirectOnFailureUrl) {
    redirect(res, redirectOnFailureUrl);
    return {type: 'redirect'};
  }

  return {type: 'fallThrough'};
};