/* node:coverage ignore next 10000 */
const { db } = require("../../db/connection");
const { dbProvider } = require("../../config/env");
const { addDays, getLastDates, getLocalDate } = require("../../lib/date");
const { mealTypes } = require("../../lib/validation");
const { getCheckinSummary } = require("../checkins/checkins.service");
const { getDayNote, listRecentDayNotes } = require("../day-notes/day-notes.service");
const { listFavorites } = require("../favorites/favorites.service");
const { getGoals } = require("../goals/goals.service");
const { getHydrationSummary } = require("../hydration/hydration.service");
const { getBodyMetricsSummary } = require("../metrics/metrics.service");
const { listMeals } = require("../meals/meals.service");
const { getPlannerSummary } = require("../planner/planner.service");
const { listProducts } = require("../products/products.service");
const { listShoppingItems } = require("../shopping/shopping.service");
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
  const topCalorieMeal = [...meals].sort((left, right) => right.calories - left.calories)[0] || null;
  const topProteinMeal = [...meals].sort((left, right) => right.protein - left.protein)[0] || null;
  const averageCalories = meals.length
    ? meals.reduce((total, meal) => total + meal.calories, 0) / meals.length
    : 0;
  const averageProtein = meals.length
    ? meals.reduce((total, meal) => total + meal.protein, 0) / meals.length
    : 0;
  const macroDeviation =
    Math.abs(100 - summary.progress.protein) +
    Math.abs(100 - summary.progress.fat) +
    Math.abs(100 - summary.progress.carbs);

  return {
    topCalorieMeal,
    topProteinMeal,
    averageCalories,
    averageProtein,
    withinCalorieGoal: summary.totals.calories <= goals.calories,
    macroBalanceStatus:
      macroDeviation < 40 ? "balanced" : macroDeviation < 90 ? "acceptable" : "unstable",
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

async function buildStreak(userId, baseDate) {
  let streak = 0;

  for (const date of [...getLastDates(baseDate, 30)].reverse()) {
    const row = await db
      .prepare(`SELECT COUNT(*) AS count FROM meals WHERE user_id = ? AND entry_date = ?`)
      .get(userId, date);

    if (row.count > 0) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

async function buildWeeklyTrend(userId, baseDate) {
  return Promise.all(
    getLastDates(baseDate, 7).map(async (date) => {
      const [mealTotals, hydrationTotals] = await Promise.all([
        db
          .prepare(
            `
              SELECT
                COALESCE(SUM(calories), 0) AS calories,
                COALESCE(SUM(protein), 0) AS protein
              FROM meals
              WHERE user_id = ? AND entry_date = ?
            `
          )
          .get(userId, date),
        db
          .prepare(
            `
              SELECT COALESCE(SUM(amount_ml), 0) AS totalMl
              FROM hydration_logs
              WHERE user_id = ? AND entry_date = ?
            `
          )
          .get(userId, date)
      ]);

      return {
        date,
        calories: mealTotals.calories,
        protein: mealTotals.protein,
        hydrationMl: hydrationTotals.totalMl
      };
    })
  );
}

async function buildExtendedTrend(userId, baseDate) {
  return Promise.all(
    getLastDates(baseDate, 14).map(async (date) => {
      const [mealTotals, checkin] = await Promise.all([
        db
          .prepare(
            `
              SELECT
                COALESCE(SUM(calories), 0) AS calories,
                COALESCE(SUM(protein), 0) AS protein
              FROM meals
              WHERE user_id = ? AND entry_date = ?
            `
          )
          .get(userId, date),
        db
          .prepare(
            `
              SELECT mood, energy
              FROM daily_checkins
              WHERE user_id = ? AND entry_date = ?
            `
          )
          .get(userId, date)
      ]);

      return {
        date,
        calories: mealTotals.calories,
        protein: mealTotals.protein,
        mood: checkin?.mood || 0,
        energy: checkin?.energy || 0
      };
    })
  );
}

function buildAchievements({
  summary,
  hydration,
  weeklyTrend,
  mealsCount,
  wellbeing,
  planner,
  bodyMetrics,
  shopping
}) {
  const activeDays = weeklyTrend.filter((item) => item.calories > 0).length;
  const achievements = [];

  if (mealsCount >= 3) {
    achievements.push({
      id: "structured-day",
      title: "Structured Day",
      description: "За день зафиксировано минимум три приема пищи."
    });
  }

  if (summary.progress.protein >= 100) {
    achievements.push({
      id: "protein-master",
      title: "Protein Master",
      description: "Цель по белку на выбранную дату достигнута."
    });
  }

  if (summary.progress.calories >= 85 && summary.progress.calories <= 105) {
    achievements.push({
      id: "calorie-balance",
      title: "Calorie Balance",
      description: "Калорийность держится рядом с дневной целью."
    });
  }

  if (hydration.progress >= 100) {
    achievements.push({
      id: "water-flow",
      title: "Water Flow",
      description: "Дневная цель по воде полностью закрыта."
    });
  }

  if (activeDays >= 5) {
    achievements.push({
      id: "steady-week",
      title: "Steady Week",
      description: "Активность в дневнике сохраняется минимум пять дней за неделю."
    });
  }

  if (wellbeing.readinessScore >= 80) {
    achievements.push({
      id: "wellbeing-sync",
      title: "Wellbeing Sync",
      description: "Самочувствие и энергия держатся на хорошем уровне."
    });
  }

  if (planner.totals.planned > 0 && planner.completionRate >= 60) {
    achievements.push({
      id: "plan-keeper",
      title: "Plan Keeper",
      description: "Большая часть дневного плана уже закрыта."
    });
  }

  if (bodyMetrics.latest && bodyMetrics.deltaWeight <= 0) {
    achievements.push({
      id: "body-progress",
      title: "Body Progress",
      description: "Последние замеры показывают положительную динамику."
    });
  }

  if (shopping.summary.pending <= 3 && shopping.summary.total > 0) {
    achievements.push({
      id: "ready-pantry",
      title: "Ready Pantry",
      description: "Список покупок почти закрыт и поддерживать режим проще."
    });
  }

  return achievements;
}

async function getProductSuggestions({ search, sortBy = "protein", limit = 3 }) {
  const products = [...(await listProducts({ search }))];

  if (sortBy === "protein") {
    products.sort((left, right) => right.protein - left.protein);
  } else if (sortBy === "carbs") {
    products.sort((left, right) => right.carbs - left.carbs);
  } else {
    products.sort((left, right) => left.calories - right.calories);
  }

  return products.slice(0, limit);
}

async function buildRecommendations(summary, wellbeing, planner, shopping) {
  const recommendations = [];

  if (summary.remaining.protein > 20) {
    recommendations.push({
      id: "protein-gap",
      title: "Добрать белок",
      text: `До цели по белку не хватает ${summary.remaining.protein.toFixed(1)} г.`,
      suggestedProducts: await getProductSuggestions({ sortBy: "protein" })
    });
  }

  if (summary.remaining.carbs > 35) {
    recommendations.push({
      id: "carb-gap",
      title: "Добавить углеводы",
      text: `Для более ровного баланса можно добрать еще ${summary.remaining.carbs.toFixed(1)} г углеводов.`,
      suggestedProducts: await getProductSuggestions({ sortBy: "carbs" })
    });
  }

  if (summary.remaining.calories < 250) {
    recommendations.push({
      id: "light-finish",
      title: "Завершить день легко",
      text: "Лучше выбирать легкие варианты, чтобы не выйти за дневной лимит.",
      suggestedProducts: await getProductSuggestions({ sortBy: "light" })
    });
  }

  if (wellbeing.entry && wellbeing.entry.stress >= 4) {
    recommendations.push({
      id: "stress-support",
      title: "Снизить пищевую нагрузку",
      text: "При высоком уровне стресса лучше держать рацион простым и предсказуемым.",
      suggestedProducts: await getProductSuggestions({ search: "йогурт" })
    });
  }

  if (planner.totals.planned > planner.totals.completed) {
    recommendations.push({
      id: "follow-plan",
      title: "Держать ритм плана",
      text: `В планере осталось ${planner.totals.planned - planner.totals.completed} незакрытых слотов.`,
      suggestedProducts: await getProductSuggestions({ sortBy: "protein" })
    });
  }

  if (shopping.summary.pending > 6) {
    recommendations.push({
      id: "shopping-focus",
      title: "Разгрузить список покупок",
      text: "Список закупки разросся. Есть смысл закрыть базовые позиции заранее.",
      suggestedProducts: await getProductSuggestions({ sortBy: "light" })
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: "stable-plan",
      title: "План держится стабильно",
      text: "Сегодняшний рацион выглядит ровно. Можно сохранить удачные блюда в шаблоны и планер.",
      suggestedProducts: await getProductSuggestions({ sortBy: "protein" })
    });
  }

  return recommendations;
}

function buildSmartScore(summary, hydration, mealsCount, wellbeing, planner) {
  const calorieScore = Math.max(0, 100 - Math.abs(100 - summary.progress.calories));
  const proteinScore = Math.min(summary.progress.protein, 100);
  const hydrationScore = Math.min(hydration.progress, 100);
  const rhythmScore = mealsCount >= 3 ? 100 : mealsCount * 30;
  const wellbeingScore = wellbeing.entry ? wellbeing.readinessScore : 55;
  const planningScore = planner.totals.planned > 0 ? Math.min(planner.completionRate + 25, 100) : 60;
  const total =
    (calorieScore + proteinScore + hydrationScore + rhythmScore + wellbeingScore + planningScore) / 6;

  return {
    total: Number(total.toFixed(1)),
    breakdown: {
      calories: Number(calorieScore.toFixed(1)),
      protein: Number(proteinScore.toFixed(1)),
      hydration: Number(hydrationScore.toFixed(1)),
      rhythm: Number(rhythmScore.toFixed(1)),
      wellbeing: Number(wellbeingScore.toFixed(1)),
      planning: Number(planningScore.toFixed(1))
    }
  };
}

async function buildComparison(userId, date, summary, hydration, wellbeing, planner) {
  const previousDate = addDays(date, -1);
  const [
    previousGoals,
    previousMeals,
    previousHydration,
    previousWellbeing,
    previousPlanner,
    weeklyTrend,
    readinessEntries
  ] = await Promise.all([
    getGoals(userId),
    listMeals(userId, { date: previousDate }),
    getHydrationSummary(userId, previousDate),
    getCheckinSummary(userId, previousDate),
    getPlannerSummary(userId, previousDate),
    buildWeeklyTrend(userId, date),
    Promise.all(getLastDates(date, 7).map((entryDate) => getCheckinSummary(userId, entryDate)))
  ]);

  const previousSummary = buildSummary(previousGoals, previousMeals);
  const readinessValues = readinessEntries.map((entry) => entry.readinessScore);
  const weeklyAverageReadiness = readinessValues.length
    ? readinessValues.reduce((total, value) => total + value, 0) / readinessValues.length
    : 0;

  return {
    previousDate,
    items: [
      {
        id: "calories",
        title: "Калории",
        unit: "ккал",
        current: summary.totals.calories,
        previous: previousSummary.totals.calories,
        delta: summary.totals.calories - previousSummary.totals.calories
      },
      {
        id: "protein",
        title: "Белок",
        unit: "г",
        current: summary.totals.protein,
        previous: previousSummary.totals.protein,
        delta: summary.totals.protein - previousSummary.totals.protein
      },
      {
        id: "hydration",
        title: "Вода",
        unit: "мл",
        current: hydration.totalMl,
        previous: previousHydration.totalMl,
        delta: hydration.totalMl - previousHydration.totalMl
      },
      {
        id: "readiness",
        title: "Готовность",
        unit: "балла",
        current: wellbeing.readinessScore,
        previous: previousWellbeing.readinessScore,
        delta: wellbeing.readinessScore - previousWellbeing.readinessScore
      },
      {
        id: "plan",
        title: "План",
        unit: "%",
        current: planner.completionRate,
        previous: previousPlanner.completionRate,
        delta: planner.completionRate - previousPlanner.completionRate
      }
    ],
    weeklyAverage: {
      calories: weeklyTrend.reduce((total, item) => total + item.calories, 0) / weeklyTrend.length,
      protein: weeklyTrend.reduce((total, item) => total + item.protein, 0) / weeklyTrend.length,
      hydrationMl: weeklyTrend.reduce((total, item) => total + item.hydrationMl, 0) / weeklyTrend.length,
      readinessScore: weeklyAverageReadiness
    }
  };
}

function buildDailyControls(summary, hydration, meals, wellbeing, planner, dayNote) {
  const items = [
    {
      id: "structure",
      title: "Структура дня",
      completed: meals.length >= 3,
      description:
        meals.length >= 3
          ? `Зафиксировано ${meals.length} приемов пищи.`
          : "Нужно минимум три приема пищи для устойчивого ритма."
    },
    {
      id: "protein",
      title: "Белковая цель",
      completed: summary.progress.protein >= 100,
      description:
        summary.progress.protein >= 100
          ? "Цель по белку закрыта."
          : `Осталось ${summary.remaining.protein.toFixed(1)} г белка.`
    },
    {
      id: "hydration",
      title: "Вода",
      completed: hydration.progress >= 80,
      description:
        hydration.progress >= 80
          ? `Гидратация на уровне ${Math.round(hydration.progress)}%.`
          : `Пока закрыто ${Math.round(hydration.progress)}% дневной воды.`
    },
    {
      id: "checkin",
      title: "Самочувствие",
      completed: Boolean(wellbeing.entry),
      description: wellbeing.entry
        ? "Дневная оценка самочувствия заполнена."
        : "Нет дневной оценки состояния."
    },
    {
      id: "planner",
      title: "План питания",
      completed: planner.totals.planned === 0 ? meals.length > 0 : planner.completionRate >= 50,
      description:
        planner.totals.planned === 0
          ? "План на день не задан, контроль идет по факту."
          : `Закрыто ${Math.round(planner.completionRate)}% дневного плана.`
    },
    {
      id: "note",
      title: "Дневная заметка",
      completed: dayNote.hasContent,
      description: dayNote.hasContent
        ? "На дату сохранен рабочий комментарий."
        : "Добавьте фокус дня, выводы или наблюдения."
    }
  ];
  const completed = items.filter((item) => item.completed).length;

  return {
    items,
    completed,
    total: items.length,
    adherence: items.length ? (completed / items.length) * 100 : 0
  };
}

async function buildShoppingSnapshot(userId) {
  const shopping = await listShoppingItems(userId);

  return {
    ...shopping,
    pendingItems: shopping.items.filter((item) => !item.checked).slice(0, 6)
  };
}

async function getDashboard(user, requestedDate = getLocalDate()) {
  const date = requestedDate;
  const [
    goals,
    meals,
    hydration,
    weeklyTrend,
    extendedTrend,
    streak,
    wellbeing,
    bodyMetrics,
    planner,
    shopping,
    dayNote,
    recentDayNotes,
    favorites,
    templates
  ] = await Promise.all([
    getGoals(user.id),
    listMeals(user.id, { date }),
    getHydrationSummary(user.id, date),
    buildWeeklyTrend(user.id, date),
    buildExtendedTrend(user.id, date),
    buildStreak(user.id, date),
    getCheckinSummary(user.id, date),
    getBodyMetricsSummary(user.id),
    getPlannerSummary(user.id, date),
    buildShoppingSnapshot(user.id),
    getDayNote(user.id, date),
    listRecentDayNotes(user.id, 5),
    listFavorites(user.id),
    listTemplates(user.id)
  ]);

  const summary = buildSummary(goals, meals);
  const recommendations = await buildRecommendations(summary, wellbeing, planner, shopping);
  const smartScore = buildSmartScore(summary, hydration, meals.length, wellbeing, planner);
  const comparison = await buildComparison(user.id, date, summary, hydration, wellbeing, planner);
  const dailyControls = buildDailyControls(summary, hydration, meals, wellbeing, planner, dayNote);

  return {
    date,
    user,
    goals,
    meals,
    summary,
    hydration,
    wellbeing,
    bodyMetrics,
    planner,
    shopping,
    dayNote,
    recentDayNotes,
    favorites,
    comparison,
    dailyControls,
    insights: buildInsights(meals, goals, summary),
    weeklyTrend,
    extendedTrend,
    streak,
    achievements: buildAchievements({
      summary,
      hydration,
      weeklyTrend,
      mealsCount: meals.length,
      wellbeing,
      planner,
      bodyMetrics,
      shopping
    }),
    recommendations,
    templates: templates.slice(0, 6),
    smartScore,
    metadata: {
      dbProvider,
      mealTypes,
      totalMeals: meals.length,
      selectedDate: date,
      nextDate: addDays(date, 1),
      previousDate: addDays(date, -1)
    }
  };
}

module.exports = {
  getDashboard
};
