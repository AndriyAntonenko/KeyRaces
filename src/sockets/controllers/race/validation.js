const Joi = require("@hapi/joi");

module.exports = {
  startNewRace: Joi.object().keys({
    raceId: Joi.string()
      .hex()
      .length(24)
      .required()
  }),

  getProgress: Joi.object().keys({
    userLogin: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required(),
    correctSymbols: Joi.number()
      .positive()
      .allow(0)
      .required(),
    raceId: Joi.string()
      .hex()
      .length(24)
      .required()
  })
};
