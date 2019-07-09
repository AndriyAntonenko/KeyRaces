const controllers = require("./wait");

module.exports = [
  {
    eventName: "wait-game",
    controller: controllers.wait
  },
  {
    eventName: "disconnect",
    controller: controllers.disconnect
  }
];
