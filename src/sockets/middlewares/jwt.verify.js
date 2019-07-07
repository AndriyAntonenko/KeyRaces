/* eslint-disable */
const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../../models/user.model");

function jwtVerify(socket, next) {
  const { headers } = socket.handshake;
  if (!headers.authorization) return next(new Error("Unauthorize"));

  const [type, token] = headers.authorization.split(" ");
  if (type !== "Bearer")
    return next(new Error("Token must be matched `Bearer` pattern"));

  jwt.verify(token, config.get("tokens.tokenSecret"), async (err, payload) => {
    if (err) {
      return next(err);
    }

    if (!payload) {
      return next(new Error("Bad JWT token"));
    }

    const user = await User.findById(payload.id).select("_id login");
  
    socket.user = {
      _id: user._id,
      login: user.login,
      progress: 0,
      time: 0
    };

    return next();
  });
}

module.exports = jwtVerify;
