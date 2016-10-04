# Paper


Paper is promise based authentication
middleware for [Node.js](http://nodejs.org/).

Paper's sole purpose is to authenticate requests, which it does through an
extensible set of plugins known as _strategies_.  

## Install

```
$ npm install paper
```

## Usage

#### Strategies

Paper uses the concept of strategies to authenticate requests.  Strategies
can range from verifying username and password credentials, delegated
authentication using [OAuth](http://oauth.net/) (for example, via [Facebook](http://www.facebook.com/)
or [Twitter](http://twitter.com/)), or federated authentication using [OpenID](http://openid.net/).

Before authenticating requests, the strategy (or strategies) used by an
application must be configured.

```javascript
paper.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));
```

There are 300+ strategies. Find the ones you want at: [paperjs.org](http://paperjs.org)

#### Sessions

Paper will maintain persistent login sessions.  In order for persistent
sessions to work, the authenticated user must be serialized to the session, and
deserialized when subsequent requests are made.

Paper does not impose any restrictions on how your user records are stored.
Instead, you provide functions to Paper which implements the necessary
serialization and deserialization logic.  In a typical application, this will be
as simple as serializing the user ID, and finding the user by ID when
deserializing.

```javascript
paper.serializeUser(function(user) {
  return user.id;
});

paper.deserializeUser(function(id) {
  return User.findById(id);
});
```
#### Middleware

To use Paper in an [Express](http://expressjs.com/) or
[Connect](http://senchalabs.github.com/connect/)-based application, configure it
with the required `paper.initialize()` middleware.  If your application uses
persistent login sessions (recommended, but not required), `paper.session()`
middleware must also be used.

```javascript
var app = express();
app.use(require('serve-static')(__dirname + '/../../public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(paper.initialize());
app.use(paper.session());
```

#### Authenticate Requests

Paper provides an `authenticate()` function, which is used as route
middleware to authenticate requests.

```javascript
app.post('/login', 
  paper.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
```

## Strategies

Paper has a comprehensive set of **over 300** authentication strategies
covering social networking, enterprise integration, API services, and more.

## Search all strategies

There is a **Strategy Search** at [paperjs.org](http://paperjs.org)

The following table lists commonly used strategies:

|Strategy                                                       | Protocol                 |Developer                                       |
|---------------------------------------------------------------|--------------------------|------------------------------------------------|
|[Local](https://github.com/jaredhanson/paper-local)         | HTML form                |[Jared Hanson](https://github.com/jaredhanson)  |
|[OpenID](https://github.com/jaredhanson/paper-openid)       | OpenID                   |[Jared Hanson](https://github.com/jaredhanson)  |
|[BrowserID](https://github.com/jaredhanson/paper-browserid) | BrowserID                |[Jared Hanson](https://github.com/jaredhanson)  |
|[Facebook](https://github.com/jaredhanson/paper-facebook)   | OAuth 2.0                |[Jared Hanson](https://github.com/jaredhanson)  |
|[Google](https://github.com/jaredhanson/paper-google)       | OpenID                   |[Jared Hanson](https://github.com/jaredhanson)  |
|[Google](https://github.com/jaredhanson/paper-google-oauth) | OAuth / OAuth 2.0        |[Jared Hanson](https://github.com/jaredhanson)  |
|[Twitter](https://github.com/jaredhanson/paper-twitter)     | OAuth                    |[Jared Hanson](https://github.com/jaredhanson)  |

## Examples

- For a complete, working example, refer to the [example](https://github.com/paper/express-4.x-local-example)
that uses [paper-local](https://github.com/jaredhanson/paper-local).
- **Local Strategy**: Refer to the following tutorials for setting up user authentication via LocalStrategy (`paper-local`):
    - Mongo
      - Express v3x - [Tutorial](http://mherman.org/blog/2016/09/25/node-paper-and-postgres/#.V-govpMrJE5) / [working example](https://github.com/mjhea0/paper-local-knex)
      - Express v4x - [Tutorial](http://mherman.org/blog/2015/01/31/local-authentication-with-paper-and-express-4/) / [working example](https://github.com/mjhea0/paper-local-express4)
    - Postgres
      - [Tutorial](http://mherman.org/blog/2015/01/31/local-authentication-with-paper-and-express-4/) / [working example](https://github.com/mjhea0/paper-local-express4)
- **Social Authentication**: Refer to the following tutorials for setting up various social authentication strategies:
    - Express v3x - [Tutorial](http://mherman.org/blog/2013/11/10/social-authentication-with-paper-dot-js/) / [working example](https://github.com/mjhea0/paper-examples)
    - Express v4x - [Tutorial](http://mherman.org/blog/2015/09/26/social-authentication-in-node-dot-js-with-paper) / [working example](https://github.com/mjhea0/paper-social-auth)

## Related Modules

- [Locomotive](https://github.com/jaredhanson/locomotive) — Powerful MVC web framework
- [OAuthorize](https://github.com/jaredhanson/oauthorize) — OAuth service provider toolkit
- [OAuth2orize](https://github.com/jaredhanson/oauth2orize) — OAuth 2.0 authorization server toolkit
- [connect-ensure-login](https://github.com/jaredhanson/connect-ensure-login)  — middleware to ensure login sessions

The [modules](https://github.com/jaredhanson/paper/wiki/Modules) page on the
[wiki](https://github.com/jaredhanson/paper/wiki) lists other useful modules
that build upon or integrate with Paper.

## Tests

```
$ npm install
$ make test
```

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## Supporters

This project is supported by ![](http://paperjs.org/images/supported_logo.svg) [Auth0](https://auth0.com) 

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2015 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
