const Joi = require("@hapi/joi");

module.exports = (req, res, next) => {
  const schemaForId = Joi.object().keys({
    raceNumber: Joi.number()
      .positive()
      .allow(0)
      .required()
  });

  Joi.validate(req.params, schemaForId, err => {
    if (err) {
      next(err);
    }
    next();
  });
};
