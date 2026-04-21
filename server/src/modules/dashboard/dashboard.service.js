const { db } = require("../../db/connection");
const { getLastDates, getLocalDate } = require("../../lib/date");
const { getGoals } = require("../goals/goals.service");
const { listMeals } = require("../meals/meals.service");
const { mealTypes } = require("../../lib/validation");
const { getHydrationSummary } = require("../hydration/hydration.service");
const { listProducts } = require("../products/products.service");
const { listTemplates } = require("../templates/templates.service");

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

function buildStreak(userId, baseDate) {
  let streak = 0;

  for (const date of [...getLastDates(baseDate, 30)].reverse()) {
    const count = db
      .prepare(`SELECT COUNT(*) AS count FROM meals WHERE user_id = ? AND entry_date = ?`)
      .get(userId, date).count;

    if (count > 0) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

function buildAchievements(summary, hydration, weeklyTrend, mealsCount) {
  const activeDays = weeklyTrend.filter((item) => item.calories > 0).length;
  const achievements = [];

  if (mealsCount >= 3) {
    achievements.push({
      id: "structured-day",
      title: "Structured Day",
      description: "За день зафиксировано минимум три приёма пищи."
    });
  }

  if (summary.progress.protein >= 100) {
    achievements.push({
      id: "protein-master",
      title: "Protein Master",
      description: "Дневная цель по белку достигнута."
    });
  }

  if (summary.progress.calories >= 85 && summary.progress.calories <= 105) {
    achievements.push({
      id: "calorie-balance",
      title: "Calorie Balance",
      description: "Калорийность удержана около дневной цели."
    });
  }

  if (hydration.progress >= 100) {
    achievements.push({
      id: "water-flow",
      title: "Water Flow",
      description: "Дневная цель по воде закрыта."
    });
  }

  if (activeDays >= 5) {
    achievements.push({
      id: "steady-week",
      title: "Steady Week",
      description: "Активность в дневнике минимум 5 дней за неделю."
    });
  }

  return achievements;
}

function getProductSuggestions({ search, sortBy = "protein", limit = 3 }) {
  const products = listProducts({ search }).slice();

  if (sortBy === "protein") {
    products.sort((left, right) => right.protein - left.protein);
  } else if (sortBy === "carbs") {
    products.sort((left, right) => right.carbs - left.carbs);
  } else {
    products.sort((left, right) => left.calories - right.calories);
  }

  return products.slice(0, limit);
}

function buildRecommendations(summary) {
  const recommendations = [];

  if (summary.remaining.protein > 20) {
    recommendations.push({
      id: "protein-gap",
      title: "Добрать белок",
      text: `До цели по белку не хватает ${summary.remaining.protein.toFixed(1)} г.`,
      suggestedProducts: getProductSuggestions({ sortBy: "protein" })
    });
  }

  if (summary.remaining.carbs > 35) {
    recommendations.push({
      id: "carb-gap",
      title: "Добавить углеводы",
      text: `Для более ровного баланса можно добрать ещё ${summary.remaining.carbs.toFixed(1)} г углеводов.`,
      suggestedProducts: getProductSuggestions({ sortBy: "carbs" })
    });
  }

  if (summary.remaining.calories < 250) {
    recommendations.push({
      id: "light-finish",
      title: "Завершить день легко",
      text: "Лучше выбирать лёгкие варианты, чтобы не выйти за дневной лимит.",
      suggestedProducts: getProductSuggestions({ sortBy: "light" })
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: "stable-plan",
      title: "План держится стабильно",
      text: "Сегодняшний рацион выглядит ровно. Можно сохранить удачные блюда в шаблоны.",
      suggestedProducts: getProductSuggestions({ sortBy: "protein" })
    });
  }

  return recommendations;
}

function buildSmartScore(summary, hydration, mealsCount) {
  const calorieScore = Math.max(0, 100 - Math.abs(100 - summary.progress.calories));
  const proteinScore = Math.min(summary.progress.protein, 100);
  const hydrationScore = Math.min(hydration.progress, 100);
  const rhythmScore = mealsCount >= 3 ? 100 : mealsCount * 30;
  const total = (calorieScore + proteinScore + hydrationScore + rhythmScore) / 4;

  return {
    total: Number(total.toFixed(1)),
    breakdown: {
      calories: Number(calorieScore.toFixed(1)),
      protein: Number(proteinScore.toFixed(1)),
      hydration: Number(hydrationScore.toFixed(1)),
      rhythm: Number(rhythmScore.toFixed(1))
    }
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
  const hydration = getHydrationSummary(user.id, date);
  const weeklyTrend = buildWeeklyTrend(user.id, date);
  const streak = buildStreak(user.id, date);
  const achievements = buildAchievements(summary, hydration, weeklyTrend, meals.length);
  const recommendations = buildRecommendations(summary);
  const templates = listTemplates(user.id).slice(0, 4);
  const smartScore = buildSmartScore(summary, hydration, meals.length);

  return {
    date,
    user,
    goals,
    meals,
    summary,
    hydration,
    insights: buildInsights(meals, goals, summary),
    weeklyTrend,
    streak,
    achievements,
    recommendations,
    templates,
    smartScore,
    metadata: {
      mealTypes,
      totalMeals: meals.length
    }
  };
}

module.exports = {
  getDashboard
};
