const { getLocalDate } = require("../../lib/date");
const { getGoals } = require("../goals/goals.service");
const { listMeals } = require("../meals/meals.service");
const { getHydrationSummary } = require("../hydration/hydration.service");

function buildReport(user, date = getLocalDate()) {
  const goals = getGoals(user.id);
  const meals = listMeals(user.id, { date });
  const hydration = getHydrationSummary(user.id, date);
  const totals = meals.reduce(
    (accumulator, meal) => {
      accumulator.calories += meal.calories;
      accumulator.protein += meal.protein;
      accumulator.fat += meal.fat;
      accumulator.carbs += meal.carbs;
      return accumulator;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  return {
    date,
    user,
    goals,
    totals,
    hydration,
    meals
  };
}

function buildCsvReport(report) {
  const lines = [
    ["nutrition_report", "Рацион"],
    ["date", report.date],
    ["user", report.user.email],
    ["goal_calories", report.goals.calories],
    ["goal_protein", report.goals.protein],
    ["goal_fat", report.goals.fat],
    ["goal_carbs", report.goals.carbs],
    ["total_calories", report.totals.calories],
    ["total_protein", report.totals.protein],
    ["total_fat", report.totals.fat],
    ["total_carbs", report.totals.carbs],
    ["water_ml", report.hydration.totalMl],
    [],
    ["meal_id", "title", "meal_type", "eaten_at", "grams", "calories", "protein", "fat", "carbs", "notes"]
  ];

  report.meals.forEach((meal) => {
    lines.push([
      meal.id,
      meal.title,
      meal.mealType,
      meal.eatenAt,
      meal.grams,
      meal.calories,
      meal.protein,
      meal.fat,
      meal.carbs,
      meal.notes || ""
    ]);
  });

  return `\uFEFF${lines
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n")}`;
}

module.exports = {
  buildCsvReport,
  buildReport
};
