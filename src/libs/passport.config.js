const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const config = require("config");

const createError = require("http-errors");

const User = require("../models/user.model");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.get("tokens.tokenSecret")
};

passport.use(
  // eslint-disable-next-line consistent-return
  new Strategy(options, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);

      return user
        ? done(null, user)
        : done(createError(401, "Invalid token"), null);
    } catch (error) {
      done(error, null);
    }
  })
);

module.exports = passport;
