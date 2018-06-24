var Auth0Strategy = require('passport-auth0'),
libuser = require("./users"),
rstr = require("randomstring");
module.exports = (pass,pool) => {
  var strategy = new Auth0Strategy({
    domain:       process.env.AUTH0_DOMAIN,
    clientID:     process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:  process.env.AUTH0_CALLBACK
  }, function(accessToken, refreshToken, extraParams, profile, done) {
    libuser.getUser(pool,profile.id,(err,org) => {
      if(err) return done(err);
      if(org) return done(null, profile);
      else {
        libuser.newUserReg(pool,profile.id, (err,org) => {
          if(err) return done(err);
          if(org) return done(null,profile);
          else return done(null,profile);
        });
      } 
    });
  });
  pass.serializeUser(function(user, done) {
    //console.log("SERIALIZE USER",user);
    done(null, user);
  });
  pass.deserializeUser(function(user, done) {
    //console.log("DESERIALIZE USER",user);
    done(null, user);
  });
  pass.use(strategy);
};