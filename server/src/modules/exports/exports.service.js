const { getLocalDate } = require("../../lib/date");
const { getGoals } = require("../goals/goals.service");
const { listMeals } = require("../meals/meals.service");
const { getHydrationSummary } = require("../hydration/hydration.service");

async function buildReport(user, date = getLocalDate()) {
  const [goals, meals, hydration] = await Promise.all([
    getGoals(user.id),
    listMeals(user.id, { date }),
    getHydrationSummary(user.id, date)
  ]);
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

module.exports = {
  buildReport
};
