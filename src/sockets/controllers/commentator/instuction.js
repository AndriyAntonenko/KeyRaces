const controllers = require("./commentator");

module.exports = [
  {
    eventName: "get-comment",
    controller: controllers.message
  }
];
