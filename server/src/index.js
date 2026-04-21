const { host, port } = require("./config/env");
const { initializeDatabase } = require("./db/init-schema");
const { createApp } = require("./app");

initializeDatabase();

const app = createApp();

app.listen(port, host, () => {
  console.log(`Food diary app is running on http://localhost:${port}`);
});
