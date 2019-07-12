const Joi = require("@hapi/joi");

module.exports = (socket, io, nmsp, instruction) => {
  // eslint-disable-next-line consistent-return
  return async (...args) => {
    const callback = args.find(arg => typeof arg === "function");

    try {
      if (instruction.validateSchema) {
        await Joi.validate(args, instruction.validateSchema);
      }

      await instruction.controller.apply({ nmsp }, [io, socket, ...args]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      return callback({
        error,
        message: error.message
      });
    }
  };
};
