const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const packageJson = require("../package.json");

const rootDir = path.resolve(__dirname, "..");
const nodeCommand = process.execPath;
const testFiles = fs
  .readdirSync(path.join(rootDir, "server", "tests"))
  .filter((filename) => filename.endsWith(".test.js"))
  .sort()
  .map((filename) => path.join("server", "tests", filename));

const steps = [
  {
    title: "Client contracts",
    command: nodeCommand,
    args: [path.join("scripts", "check-client.js")]
  },
  {
    title: "Test suite",
    command: nodeCommand,
    args: [path.join("scripts", "run-tests-with-table.js")]
  },
  {
    title: "Surface coverage report",
    command: nodeCommand,
    args: [path.join("scripts", "generate-test-coverage-report.js"), "--check"]
  },
  {
    title: "Raw V8 coverage table",
    command: nodeCommand,
    args: [
      "--test",
      "--test-concurrency=1",
      "--experimental-test-coverage",
      "--test-coverage-lines=100",
      "--test-coverage-branches=100",
      "--test-coverage-functions=100",
      "--test-reporter=spec",
      ...testFiles
    ]
  }
];

function runStep(step) {
  return new Promise((resolve, reject) => {
    const child = spawn(step.command, step.args, {
      cwd: rootDir,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${step.title} failed with code ${code}`));
    });
  });
}

async function main() {
  console.log(`Preparing pre-release bundle for ${packageJson.name} ${packageJson.version}`);
  console.log(`Started at ${new Date().toISOString()}`);
  console.log(`Node runtime ${process.version}`);

  for (const [index, step] of steps.entries()) {
    console.log(`\n[${index + 1}/${steps.length}] ${step.title}`);
    await runStep(step);
  }

  console.log("\nPre-release checks completed successfully.");
  console.log("Next: update release notes, push the rc branch/tag, and verify cloud deployment.");
}

main().catch((error) => {
  console.error(`\nPre-release check failed: ${error.message}`);
  process.exitCode = 1;
});
