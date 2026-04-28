const {
  host,
  port,
  serverHeadersTimeoutMs,
  serverKeepAliveTimeoutMs,
  serverRequestTimeoutMs,
  shutdownTimeoutMs
} = require("./config/env");
const { closeDatabase } = require("./db/connection");
const { logger } = require("./lib/logger");
const { setDraining } = require("./runtime/state");

function createHttpServer(app) {
  const server = app.listen(port, host, () => {
    logger.info("runtime.listening", {
      host,
      port
    });
  });

  server.requestTimeout = serverRequestTimeoutMs;
  server.headersTimeout = serverHeadersTimeoutMs;
  server.keepAliveTimeout = serverKeepAliveTimeoutMs;

  const sockets = new Set();

  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });

  let shuttingDown = false;

  async function shutdown(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    setDraining(true);
    logger.warn("runtime.shutdown.started", { signal });

    const forceCloseTimer = setTimeout(() => {
      sockets.forEach((socket) => socket.destroy());
    }, shutdownTimeoutMs);

    forceCloseTimer.unref();

    return new Promise((resolve) => {
      server.close(async (error) => {
        clearTimeout(forceCloseTimer);

        if (error) {
          logger.error("runtime.shutdown.server-close-failed", { error });
        }

        try {
          await closeDatabase();
        } catch (dbError) {
          logger.error("runtime.shutdown.database-close-failed", { error: dbError });
        }

        logger.info("runtime.shutdown.completed", { signal });
        resolve();
      });

      if (typeof server.closeIdleConnections === "function") {
        server.closeIdleConnections();
      }
    });
  }

  process.on("SIGINT", () => {
    shutdown("SIGINT").finally(() => process.exit(0));
  });

  process.on("SIGTERM", () => {
    shutdown("SIGTERM").finally(() => process.exit(0));
  });

  server.shutdown = shutdown;

  return server;
}

module.exports = {
  createHttpServer
};
