# Koa-Papers


koa-papers is promise based authentication
middleware for [Node.js](http://nodejs.org/) designed for use in [koa].(http://koajs.com/)

koa-papers is basically a port of [papers](https://www.npmjs.com/package/papers) 
which takes advantage of, and/or accommodates some of the differences in koa.

The usage is actually exactly the same between the two, the differences
are under the covers in how koa handles the request and middleware.

Currently all the strategies I have created work with both implementations.

So I will defer to those docs, but I will include a short synopsis here 

## Why Papers
  - Not a fan of callbacks, and found passport logic very difficult to follow
  - I have also had a difficult time in the past figuring out/using Passport.
  - More functional style with less/no state if possible.  

## Key differences
  - Papers uses promises and co routines to handle the async or potentially async
  processes involved in authentication
  - Papers only extends the request with two functions (isAuthenticated and logout)
  and one property (user or whatever you set the userProperty to be).  It does not touch your strategies
  - Papers setup is different (simpler and more concise in my view).

## Install

```
$ npm install paper
```

## Usage

```javascript
var myStrategy = localStrategy(function(username, password) {
    // retrieve your user in some way.  
    // if you get an error or it fails to find user
    // return type: 'error' or type: 'fail'
    return {type: 'success', details: {user: user}};
));

var serializeUser = function(user) {
  return user.id;
});

var deserializeUser = function(id) {
  // retrieve your user again in someway
  return User.findById(id);
});

var papersConfig = {
  strategies: [ myStrategy ],
  useSession: true,
  serializers: [ serializeUser ],
  deserializers: [ deserializeUser ]
}

app.use(papers().registerMiddleware(config));
```

#### Authenticate Requests

By calling registerMiddleware you have told express to apply your strategy(ies) to every request.
If you specify useSession to be true,  it will always check session first before trying to authenticate.
If you would like to only authenticate a certain route then instead of

```javascript
app.use(papers().registerMiddleware(config));
```
you would use

```javascript
app.post('/login',
  papers().registerMiddleware(config),
  function(req, res) {
    res.redirect('/');
  });
```

### Search Passport strategies and convert to use promises and/or async/await

There is a **Strategy Search** at [paperjs.org](http://paperjs.org)
Please feel free to port these to papers or ask me to do it.



## Data Flow
**Typical path**
  - your request comes in
    - we decorate request with "logOut" function and "isAuthenticated" function
      - logOut is a convience method that cleans up for you, with out your needing
      to go into Papers
      - isAuthenticated is another convience method to give you a quick status check
      - all other functionality is taken care of inside of papers
    - We check if you are using session and if so whether you are already logged in
    - If already logged in we put the user on the request and call the next middleware
    - If not useing session or not logged in we then iterate over your specified strategies
      - If your first strategy fails, we save the message and try the next
      - If all your strategies fail, the default behavior is to set a "www-authenicate" header with the accumulated errors
        and end response with a 401
      - If your strategy returns or throws an error we call the next middleware passing in the error.  This will be
        handled either by your error handling middleware or by your controller action
      - If your strategy returns a success then the user will be placed on the request and the next middleware will be called.
    - In some of those cases your request will land in your controller and you will be able to handle it however you like.
    - There are a couple of alternative paths you might want to use

**Custom handling**
    alternatively you can provide a custom handler that deals with each state as it comes back

  - your request comes in
    - we decorate request with "logOut" function and "isAuthenticated" function
    - We check if you are using session and if so whether you are already logged in
    - If already logged in we put the user on the request and call the next middleware
    - If not useing session or not logged in we then iterate over your specified strategies
      - If your first strategy fails, we save the message and try the next
      - If all your strategies fail we call your custom handler with the following
        - Request, response, next, result
        - The result is the standard result format `{type: 'fail', details: { error: [collection of errors] }`
      - If your strategy returns or throws an error we call your custom handler with the following
        - request, response, next, result
        - The result is the standard result format `{type: 'error', details: { error: exception }`
      - If your strategy returns a success then the user will be placed on the request and we call your custom handler with the following
        - request, response, next, result
        - The result is the standard result format `{type: 'success', details: { user: user }`
    - It is the responsibility of your custom handler to either end the request or call the next middleware.
    - Essentially the custom handler acts as your controller action which can optionally proceed through the middleware or return short.

    ### Custom failure path
    - You can specify the following options in your papers config
      - failWithError : bool
      - failureRedirect: url (string)
    - Your request comes in and strategies all fails
      - failWithError is true
        - changes result from 'fail' to 'error' and is handled as such
      - failureRedirect is set
        - instead of directly returning with 401, it redirects to the provided url with 401

    ### Custom success
    - You can specify the following option in your papers config
      - successRedirect: url (string)
    - Your request comes in succeeds
      - successRedirect is set
        - instead of proceeding to next middleware and ultimately your controller action
        it places user on request and redirects to provided url

    ### Missing features
    - If there are any features that you are used to from passport but are missing here
    please let me know and I will implemnt them


## Tests

```
$ npm install
$ npm test
$ npm run intTests

```

## Credits

  - Thanks to [Jared Hanson](http://github.com/jaredhanson) for the inspiration

## License

[The MIT License](http://opensource.org/licenses/MIT)
