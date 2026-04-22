const test = require("node:test");
const assert = require("node:assert/strict");

const {
  assertDate,
  assertEmail,
  assertMealType,
  assertNumber,
  assertPassword,
  assertProductCategory,
  assertTime,
  mealTypes,
  productCategories
} = require("../src/lib/validation");
const { addDays, getLastDates } = require("../src/lib/date");

test.describe("validation helpers", () => {
  test("accept valid dates and reject impossible calendar values", () => {
    assert.doesNotThrow(() => assertDate("2026-04-22"));

    assert.throws(
      () => assertDate("2026-02-30"),
      (error) => error.statusCode === 400 && /valid calendar date/.test(error.message)
    );
  });

  test("accept valid times and reject impossible hour-minute combinations", () => {
    assert.doesNotThrow(() => assertTime("08:45"));

    assert.throws(
      () => assertTime("24:60"),
      (error) => error.statusCode === 400 && /valid time/.test(error.message)
    );
  });

  test("validates email and password rules", () => {
    assert.doesNotThrow(() => assertEmail("demo@example.com"));
    assert.doesNotThrow(() => assertPassword("Password123!"));

    assert.throws(
      () => assertEmail("invalid-email"),
      (error) => error.statusCode === 400 && /valid email/.test(error.message)
    );

    assert.throws(
      () => assertPassword("short"),
      (error) => error.statusCode === 400 && /at least 8 characters/.test(error.message)
    );
  });

  test("validates numeric, meal type and category constraints", () => {
    assert.doesNotThrow(() => assertNumber(10, "calories"));
    assert.doesNotThrow(() => assertMealType(mealTypes[0]));
    assert.doesNotThrow(() => assertProductCategory(productCategories[0]));

    assert.throws(
      () => assertNumber(-1, "calories"),
      (error) => error.statusCode === 400 && /non-negative number/.test(error.message)
    );

    assert.throws(
      () => assertMealType("Late dinner"),
      (error) => error.statusCode === 400 && /must be one of/.test(error.message)
    );

    assert.throws(
      () => assertProductCategory("Supplements"),
      (error) => error.statusCode === 400 && /must be one of/.test(error.message)
    );
  });
});

test.describe("date helpers", () => {
  test("shifts dates forward and backward", () => {
    assert.equal(addDays("2026-04-22", 1), "2026-04-23");
    assert.equal(addDays("2026-04-22", -2), "2026-04-20");
  });

  test("builds ordered date windows", () => {
    assert.deepEqual(getLastDates("2026-04-22", 4), [
      "2026-04-19",
      "2026-04-20",
      "2026-04-21",
      "2026-04-22"
    ]);
  });
});
