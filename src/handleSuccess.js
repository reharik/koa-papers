const redirect = require('./redirect');

module.exports = (stratResult, req, res, papers) => {
  if (papers.functions.customHandler) {
    return {type: 'customHandler', result: 'success', value: stratResult};
  }

  // /********* successFlash *************/
  // if (clientOptions.successFlash) {
  //   var flash = {
  //     type: clientOptions.successFlash.type || info.type || 'success',
  //     message: clientOptions.successFlash.message || info.message || info || 'success'
  //   };
  //   req.flash(flash.type, flash.msg);
  // }
  //
  // /********* successMessage *************/
  // if (clientOptions.successMessage) {
  //   req.session.messages = req.session.messages || [];
  //   req.session.messages.push(typeof msg == 'boolean' ? info.message || info || 'success' : msg);
  // }
  //
  /********* assignProperty *************/
  // this seems spurious
  // if (papers.options.assignProperty) {
  //   req[papers.options.assignProperty] = user;
  //   return {type: 'success'};
  // }

  papers.functions.logIn(req, stratResult.details.user, papers);

  // /********* authInfo *************/
  // if (clientOptions.authInfo !== false) {
  //   req.authInfo = papers.transformAuthInfo(info);
  // }

  /********* redirect *************/
  var redirectUrl = req.session && req.session.returnTo ? req.session.returnTo : papers.options.successRedirect;
  if (req.session) {
    delete req.session.returnTo;
  }
  if (redirectUrl) {
    return {type: 'redirect', value: redirect(res, redirectUrl, 200)};
  }
  return {type: 'success'};
};