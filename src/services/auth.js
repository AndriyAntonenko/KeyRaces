const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const createError = require("http-errors");

const User = require("../models/user.model");

const encryptoPassword = async pass => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(pass, salt);

  return passwordHash;
};

const getToken = id =>
  jwt.sign({ id }, config.get("tokens.tokenSecret"), { expiresIn: "24h" });

exports.signup = async (req, res, next) => {
  const { login, password } = req.body;

  try {
    const [passwordHash, userWithCurtLog] = await Promise.all([
      encryptoPassword(password),
      User.findOne({ login })
    ]);
    if (userWithCurtLog) {
      throw createError(400, "User with such login is allready exist");
    }

    const user = await User.create({
      login,
      passwordHash
    });

    const token = getToken(user._id);

    res.status(200).json({
      success: true,
      data: { token }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { login, password } = req.body;

  try {
    const user = await User.findOne({ login });
    if (!user) {
      throw createError(400, "Invalid login or password");
    }

    const passwordIsValid = await user.isValidPassword(password);
    if (!passwordIsValid) {
      throw createError(400, "Invalid login or password");
    }

    const token = getToken(user._id);

    res.status(200).json({
      success: true,
      data: { token }
    });
  } catch (error) {
    next(error);
  }
};
