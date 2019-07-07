const bodyParser = require("./bodyParser");
const logger = require("./logger");

module.exports = app => {
  bodyParser(app);
  app.use(logger);
};
