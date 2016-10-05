
module.exports = (papers, ctx) => {
    /********* check session for auth *************/
    if (papers.options.useSession
        && ctx.session[papers.options.key]
        && ctx.session[papers.options.key].user) {
        return papers.functions.deserializeUser(ctx.session[papers.options.key].user, papers)
            .then(result => {

                const user = result;
                if (!user) {
                  delete ctx.session[papers.options.key].user;
                  return Promise.resolve({isLoggedIn: false});
                }
                ctx.request[papers.options.userProperty] = user;
              return Promise.resolve({isLoggedIn: true});
            }).catch(ex => {
            throw new Error("Error thrown during deserialization of user.");
        });
    }
  //TODO see why we need promise here
    return Promise.resolve({isLoggedIn: false});
};