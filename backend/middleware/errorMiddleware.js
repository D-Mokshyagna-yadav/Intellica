const { AppError } = require("../utils/errors");
const logger = require("../utils/logger");

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  logger.error(
    {
      err,
      path: req.originalUrl,
      method: req.method,
      statusCode,
    },
    err.message || "Unhandled server error"
  );

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
