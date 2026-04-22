const test = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "security-suite-secret";

delete require.cache[require.resolve("../src/config/env")];
delete require.cache[require.resolve("../src/lib/security")];

const {
  hashPassword,
  signAccessToken,
  verifyAccessToken,
  verifyPassword
} = require("../src/lib/security");

test.describe("security helpers", () => {
  test("hashes passwords and validates correct credentials", () => {
    const passwordHash = hashPassword("Demo123!");

    assert.notEqual(passwordHash, "Demo123!");
    assert.equal(verifyPassword("Demo123!", passwordHash), true);
    assert.equal(verifyPassword("Wrong123!", passwordHash), false);
  });

  test("signs and verifies access tokens with role payload", () => {
    const token = signAccessToken({
      email: "admin@example.com",
      id: 77,
      name: "Admin QA",
      role: "admin"
    });

    const payload = verifyAccessToken(token);

    assert.equal(payload.sub, 77);
    assert.equal(payload.role, "admin");
    assert.equal(payload.email, "admin@example.com");
    assert.equal(payload.name, "Admin QA");
    assert.ok(payload.exp > payload.iat);
  });

  test("rejects tampered access tokens", () => {
    const token = signAccessToken({
      email: "demo@example.com",
      id: 55,
      name: "Demo User",
      role: "user"
    });

    const [header, payload, signature] = token.split(".");
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...decodedPayload, role: "admin" })
    ).toString("base64url");

    assert.throws(() => verifyAccessToken(`${header}.${tamperedPayload}.${signature}`));
  });
});
