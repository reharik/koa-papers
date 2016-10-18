# Koa-Papers


koa-papers is promise based authentication
middleware for [Node.js](http://nodejs.org/) designed for use in [koa].(http://koajs.com/)

koa-papers is basically a port of [papers](https://www.npmjs.com/package/papers) 
which takes advantage of, and/or accommodates some of the differences in koa.

The usage is actually exactly the same between the two, the differences
are under the covers in how koa handles the request and middleware.

Currently all the strategies I have created work with both implementations.

So I will defer to those docs, but I will include a short synopsis here 

A couple of notable exceptions are that if the papers docs are discussing "request" it's probably "this" or "ctx" in koa.  And that in the case of using a `customHandler` if you want to return next you must actually make your `customHandler` a generator and `yield next`
 

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


### Search Passport strategies and convert to use promises and/or async/await

There is a **Strategy Search** at [paperjs.org](http://paperjs.org)
Please feel free to port these to papers or ask me to do it.

## API

### papers.registerMiddleware(config={})

Produces middleware ready to provide to either app `app.use(...)`
or a route `app.post('/login', ..., (req,res)=> {}) `. 
Valid `config` keys include

- `strategies` (required) - [array] an array of one or more configured papers-strategies.
- `userProperty` (optional) - [string] default is 'user', you can provide your own key if you like.
- `failWithError` (optional) - [bool] default is 'false'.  If true if all strategies fail then it throws error rather than calling next with the errors.
- `failureRedirect` (optional) - [string] default is 'undefined'. If provided a url and all strategies fail, then you are redirected to said url.
- `successRedirect` (optional) - [string] default is 'undefined'. If provided a url and strategy succeeds, then you are redirected to said url.
- `useSession` (optional) - [bool] default is 'false'. specify whether you want to use session or not
	- If you set useSession to true, 
		- You must specify at least one serialize function and one deserialize function
		- You must also have enabled session in your express or koa app.
			- app.use(session());
- `serializers` (optional) - [array[functions]] default is '[]' . If using session you must provide at least one function that takes a `user` and returns a serialized value for putting in session.
- `deserializers` (optional) - [array[functions]] default is '[]' . if using session you must provide at least one function that takes a serialized `user` and returns a deserialized value for placing in request.
- `customHandler` (optional) - [function] default is 'undefined'. If provided, the custom handler is used ***instead of*** internal failure, success and error paths.
	- signature that is passed is all three cases is customHandler(request, respose, next, result)
		- request - connect request object
		- response - connect response object
		- next - middle ware next function, call to pass on to next middleware
		- result - the result of your strategy, either a failure message, a user in case of success or an error
			- `failure` -> `{type:'failure', details:{errorMessage: 'string', statusCode: someStatusCode, exception: exception if provided}}`
			- `error` -> `{type:'error', details:{errorMessage: 'string', statusCode: someStatusCode, exception: exception if provided}}`
			- `success` -> `{type:'success', details:{user:user}}`



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
