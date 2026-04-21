const { db } = require("../../db/connection");
const { getLastDates, getLocalDate } = require("../../lib/date");
const { getGoals } = require("../goals/goals.service");
const { listMeals } = require("../meals/meals.service");
const { mealTypes } = require("../../lib/validation");

function buildSummary(goals, meals) {
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

  const remaining = {
    calories: Math.max(goals.calories - totals.calories, 0),
    protein: Math.max(goals.protein - totals.protein, 0),
    fat: Math.max(goals.fat - totals.fat, 0),
    carbs: Math.max(goals.carbs - totals.carbs, 0)
  };

  const progress = {
    calories: goals.calories ? (totals.calories / goals.calories) * 100 : 0,
    protein: goals.protein ? (totals.protein / goals.protein) * 100 : 0,
    fat: goals.fat ? (totals.fat / goals.fat) * 100 : 0,
    carbs: goals.carbs ? (totals.carbs / goals.carbs) * 100 : 0
  };

  return {
    totals,
    remaining,
    progress
  };
}

function buildInsights(meals, goals, summary) {
  const topCalorieMeal = [...meals].sort(
    (left, right) => right.calories - left.calories
  )[0] || null;
  const topProteinMeal = [...meals].sort(
    (left, right) => right.protein - left.protein
  )[0] || null;
  const averageCalories = meals.length
    ? meals.reduce((total, meal) => total + meal.calories, 0) / meals.length
    : 0;
  const averageProtein = meals.length
    ? meals.reduce((total, meal) => total + meal.protein, 0) / meals.length
    : 0;

  return {
    topCalorieMeal,
    topProteinMeal,
    averageCalories,
    averageProtein,
    withinCalorieGoal: summary.totals.calories <= goals.calories,
    mealTypeBreakdown: mealTypes.map((mealType) => {
      const items = meals.filter((meal) => meal.mealType === mealType);

      return {
        mealType,
        count: items.length,
        calories: items.reduce((total, meal) => total + meal.calories, 0)
      };
    })
  };
}

function buildWeeklyTrend(userId, baseDate) {
  return getLastDates(baseDate, 7).map((date) => {
    const totals = db
      .prepare(`
        SELECT
          COALESCE(SUM(calories), 0) AS calories,
          COALESCE(SUM(protein), 0) AS protein
        FROM meals
        WHERE user_id = ? AND entry_date = ?
      `)
      .get(userId, date);

    return {
      date,
      calories: totals.calories,
      protein: totals.protein
    };
  });
}

function getDashboard(user) {
  const date = getLocalDate();
  const goals = getGoals(user.id);
  const meals = listMeals(user.id, { date });
  const summary = buildSummary(goals, meals);

  return {
    date,
    user,
    goals,
    meals,
    summary,
    insights: buildInsights(meals, goals, summary),
    weeklyTrend: buildWeeklyTrend(user.id, date),
    metadata: {
      mealTypes,
      totalMeals: meals.length
    }
  };
}

module.exports = {
  getDashboard
};
