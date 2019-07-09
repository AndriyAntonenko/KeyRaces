const controllers = require("./race");
const validation = require("./validation");

module.exports = [
  {
    eventName: "join-to-race",
    controller: controllers.startNewRace,
    validationSchema: validation.startNewRace
  },
  {
    eventName: "get-progress",
    controller: controllers.getProgress,
    validation: validation.getProgress
  },
  {
    eventName: "disconnect",
    controller: controllers.disconnect
  }
];
