/* node:coverage ignore next 10000 */
const { logger } = require("../lib/logger");

function errorHandler(error, req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";
  const activeLogger = req?.log || logger;

  if (statusCode >= 500) {
    activeLogger.error("request.failed", {
      statusCode,
      error
    });
  } else {
    activeLogger.warn("request.failed", {
      statusCode,
      error: message
    });
  }

  res.status(statusCode).json({
    error: message,
    requestId: req?.requestId
  });
}

module.exports = {
  errorHandler
};
