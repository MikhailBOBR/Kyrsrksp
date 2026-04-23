const crypto = require("node:crypto");
const { requestIdHeader } = require("../config/env");
const { logger } = require("../lib/logger");
const { isDraining } = require("../runtime/state");

function buildRequestId(candidate) {
  const normalized = typeof candidate === "string" ? candidate.trim() : "";

  if (normalized) {
    return normalized.slice(0, 120);
  }

  return crypto.randomUUID();
}

function requestContext(req, res, next) {
  const requestId = buildRequestId(req.get(requestIdHeader));
  const startedAt = process.hrtime.bigint();

  req.requestId = requestId;
  req.log = logger.child({
    requestId,
    method: req.method,
    path: req.originalUrl
  });

  res.setHeader(requestIdHeader, requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const payload = {
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    };

    if (res.statusCode === 503 && isDraining()) {
      req.log.warn("request.completed", payload);
      return;
    }

    if (res.statusCode >= 500) {
      req.log.error("request.completed", payload);
      return;
    }

    if (res.statusCode >= 400) {
      req.log.warn("request.completed", payload);
      return;
    }

    req.log.info("request.completed", payload);
  });

  next();
}

function rejectWhenDraining(req, res, next) {
  if (!isDraining()) {
    next();
    return;
  }

  res.status(503).json({
    error: "Service is shutting down",
    requestId: req.requestId
  });
}

module.exports = {
  rejectWhenDraining,
  requestContext
};
