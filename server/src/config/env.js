const path = require("node:path");

const rootDir = path.resolve(__dirname, "../../..");

module.exports = {
  host: "0.0.0.0",
  port: Number(process.env.SERVER_PORT || 8080),
  jwtSecret: process.env.JWT_SECRET || "super-secret-dev-key",
  dbPath: process.env.DB_PATH || path.join(rootDir, "server", "data", "app.db"),
  clientRoot: path.join(rootDir, "client"),
  demoUser: {
    email: "demo@nutritrack.local",
    password: "Demo123!",
    name: "Demo User"
  },
  adminUser: {
    email: "admin@nutritrack.local",
    password: "Admin123!",
    name: "System Admin"
  }
};
