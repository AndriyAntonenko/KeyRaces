const Joi = require("@hapi/joi");

module.exports = (req, res, next) => {
  const schemaForId = Joi.object().keys({
    login: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{3,30}$/)
      .required()
  });

  Joi.validate(req.body, schemaForId, err => {
    if (err) {
      next(err);
    }
    next();
  });
};
