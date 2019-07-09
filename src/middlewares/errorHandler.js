const createError = require("http-errors");

module.exports = app => {
  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404, "Not Found"));
  });

  // error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const statusCode = err.name === "ValidationError" ? 400 : err.status;

    res.status(statusCode || 500).json({
      success: false,
      data: { error: err.message }
    });
  });
};
