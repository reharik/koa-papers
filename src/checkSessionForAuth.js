
module.exports = (papers, req) => {
    /********* check session for auth *************/
    if (papers.options.useSession
        && req.session[papers.options.key]
        && req.session[papers.options.key].user) {
        return papers.functions.deserializeUser(req.session[papers.options.key].user, papers)
            .then(result => {
                const user = result;
                if (!user) {
                    delete req.session[papers.options.key].user;
                  return Promise.resolve({isLoggedIn: false});
                }
                req[papers.options.userProperty] = user;
              return Promise.resolve({isLoggedIn: true});
            }).catch(ex => {
            throw new Error("Error thrown during deserialization of user.");
        });
    }
  //TODO see why we need promise here
    return Promise.resolve({isLoggedIn: false});
};