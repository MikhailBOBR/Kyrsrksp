const assert = require("node:assert/strict");
const path = require("node:path");

const { assertClientContracts, readClientArtifacts } = require("./lib/client-contracts");

const rootDir = path.resolve(__dirname, "..");

assertClientContracts({
  ...readClientArtifacts(rootDir),
  assert
});

console.log("client-static-ok");
