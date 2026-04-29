const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const testFiles = fs
  .readdirSync(path.join(rootDir, "server", "tests"))
  .filter((filename) => filename.endsWith(".test.js"))
  .sort()
  .map((filename) => path.join("server", "tests", filename));

const args = [
  "--test",
  "--test-concurrency=1",
  "--experimental-test-coverage",
  "--test-coverage-lines=100",
  "--test-coverage-branches=100",
  "--test-coverage-functions=100",
  "--test-reporter=spec",
  ...testFiles
];

const env = { ...process.env };

if (!env.NO_COLOR && !env.FORCE_COLOR) {
  env.FORCE_COLOR = "1";
}

function recolorCoverageHeaders(chunk) {
  const text = chunk.toString();
  const green = "\u001b[32m";
  const reset = "\u001b[39m";

  return text
    .replace(/\u001b\[[0-9;]*m(line %)\u001b\[[0-9;]*m/g, `${green}$1${reset}`)
    .replace(/\u001b\[[0-9;]*m(branch %)\u001b\[[0-9;]*m/g, `${green}$1${reset}`)
    .replace(/\u001b\[[0-9;]*m(funcs %)\u001b\[[0-9;]*m/g, `${green}$1${reset}`)
    .replace(/(line %|branch %|funcs %)/g, `${green}$1${reset}`);
}

const child = spawn(process.execPath, args, {
  cwd: rootDir,
  env,
  stdio: ["ignore", "pipe", "pipe"]
});

child.stdout.on("data", (chunk) => {
  process.stdout.write(recolorCoverageHeaders(chunk));
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(recolorCoverageHeaders(chunk));
});

child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

child.on("close", (code) => {
  process.exitCode = code;
});
