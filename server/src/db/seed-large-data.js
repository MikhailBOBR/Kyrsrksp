const { adminUser, demoUser } = require("../config/env");
const { addDays, getLocalDate, getTimestamp } = require("../lib/date");
const { hashPassword } = require("../lib/security");
const { seedWellbeingRange } = require("../modules/checkins/checkins.service");
const { db } = require("./connection");
const { initializeDatabase } = require("./init-schema");

const mealTypes = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус"
};

const BULK_SEED_CONFIG = {
  sampleUsers: 12,
  demoHistoryDays: 120,
  sampleHistoryDays: 75,
  demoTemplateCount: 24,
  sampleTemplateCount: 12,
  demoMetricCount: 16,
  sampleMetricCount: 8,
  plannerDays: 6
};

const productBlueprints = [
  {
    category: "Белковые продукты",
    brand: "NutriFarm",
    items: [
      ["Куриная грудка", 165, 31, 3.6, 0],
      ["Индейка филе", 114, 24, 1.5, 0],
      ["Тунец в собственном соку", 132, 28, 1, 0],
      ["Творог 5%", 121, 17, 5, 3],
      ["Тофу", 84, 10, 4.8, 1.2],
      ["Лосось слабосоленый", 202, 22, 12, 0],
      ["Креветки очищенные", 98, 20, 1.5, 0.8],
      ["Сыр моцарелла light", 188, 23, 9, 2],
      ["Яичный белок пастеризованный", 48, 11, 0.2, 0.7],
      ["Говядина постная", 187, 26, 9, 0],
      ["Йогурт греческий", 97, 9, 4.2, 3.8],
      ["Протеиновый пудинг", 92, 15, 2, 6]
    ]
  },
  {
    category: "Крупы и гарниры",
    brand: "Field Kitchen",
    items: [
      ["Гречка ядрица", 110, 4.2, 1.1, 21.3],
      ["Булгур", 123, 4.5, 0.8, 25.2],
      ["Киноа", 120, 4.4, 1.9, 21.3],
      ["Картофель запеченный", 93, 2.5, 0.1, 21],
      ["Макароны из твердых сортов", 131, 5, 1.1, 25],
      ["Перловка", 109, 3.1, 0.4, 22.8],
      ["Пюре батата", 89, 1.6, 0.1, 20.7],
      ["Кускус", 112, 3.8, 0.4, 22.1],
      ["Овсяные хлопья", 366, 12.3, 6.2, 61.8],
      ["Рис жасмин", 129, 2.8, 0.3, 28.4],
      ["Рис басмати", 130, 2.7, 0.3, 28],
      ["Чечевица отварная", 116, 9, 0.4, 20]
    ]
  },
  {
    category: "Овощи",
    brand: "Green Basket",
    items: [
      ["Брокколи", 34, 2.8, 0.4, 6.6],
      ["Цветная капуста", 30, 2.5, 0.3, 5.4],
      ["Огурец", 15, 0.8, 0.1, 2.8],
      ["Томаты черри", 19, 0.9, 0.2, 3.9],
      ["Авокадо", 160, 2, 14.7, 8.5],
      ["Шпинат", 23, 2.9, 0.4, 3.6],
      ["Морковь", 41, 0.9, 0.2, 9.6],
      ["Свекла", 43, 1.6, 0.2, 10],
      ["Стручковая фасоль", 31, 1.8, 0.1, 7],
      ["Пекинская капуста", 16, 1.2, 0.2, 2.2],
      ["Кабачок", 24, 0.6, 0.3, 4.6],
      ["Сладкий перец", 27, 1, 0.2, 5.3]
    ]
  },
  {
    category: "Фрукты",
    brand: "Nature Choice",
    items: [
      ["Яблоко", 52, 0.3, 0.2, 14],
      ["Груша", 57, 0.4, 0.1, 15],
      ["Киви", 61, 1.1, 0.5, 14.7],
      ["Апельсин", 47, 0.9, 0.1, 11.8],
      ["Манго", 60, 0.8, 0.4, 15],
      ["Голубика", 57, 0.7, 0.3, 14.5],
      ["Малина", 52, 1.2, 0.7, 12],
      ["Виноград", 69, 0.7, 0.2, 18.1],
      ["Ананас", 50, 0.5, 0.1, 13.1],
      ["Персик", 39, 0.9, 0.3, 9.5],
      ["Банан", 89, 1.1, 0.3, 22.8],
      ["Клубника", 32, 0.7, 0.3, 7.7]
    ]
  },
  {
    category: "Напитки",
    brand: "Hydro Lab",
    items: [
      ["Кефир 1%", 40, 3, 1, 4],
      ["Миндальное молоко", 24, 0.6, 1.1, 3.2],
      ["Комбуча", 21, 0.2, 0, 4.8],
      ["Кокосовая вода", 19, 0.7, 0.2, 3.7],
      ["Протеиновый шейк ваниль", 78, 15, 1.5, 2.7],
      ["Томатный сок", 21, 1, 0.1, 4.2],
      ["Овсяное молоко", 43, 0.9, 1.4, 6.5],
      ["Айран", 27, 1.7, 1, 1.9],
      ["Зеленый смузи", 36, 1.2, 0.4, 7.1],
      ["Лимонад без сахара", 3, 0, 0, 0.7],
      ["Матча латте light", 31, 1.2, 0.9, 4.2],
      ["Какао без сахара", 44, 2.5, 1.4, 5.1]
    ]
  },
  {
    category: "Десерты",
    brand: "Fit Dessert",
    items: [
      ["Протеиновый батончик", 188, 18, 6.4, 15],
      ["Йогуртовое мороженое", 126, 4.3, 3.8, 18.6],
      ["Шоколад 85%", 540, 8, 44, 21],
      ["Творожный чизкейк fit", 168, 14, 7, 12],
      ["Финики", 282, 2.5, 0.4, 75],
      ["Запеченное яблоко", 74, 0.5, 0.3, 19],
      ["Белковое печенье", 350, 22, 8, 43],
      ["Рисовый пудинг", 136, 4.1, 2.8, 24],
      ["Мусс из рикотты", 154, 9.6, 8.4, 9.2],
      ["Арахисовая паста", 588, 25, 50, 20],
      ["Сырники без сахара", 181, 15, 8, 11],
      ["Панкейки овсяные", 208, 11, 5, 28]
    ]
  },
  {
    category: "Прочее",
    brand: "Smart Pantry",
    items: [
      ["Хумус", 166, 7.9, 9.6, 14.3],
      ["Оливковое масло", 884, 0, 100, 0],
      ["Семена чиа", 486, 16.5, 30.7, 42.1],
      ["Льняные семена", 534, 18.3, 42.2, 28.9],
      ["Гранола", 471, 10.5, 20.1, 60.2],
      ["Ореховая смесь", 612, 18.4, 53.3, 21],
      ["Салатный микс", 19, 1.8, 0.2, 2.9],
      ["Соус терияки", 89, 3.3, 0.1, 18.6],
      ["Тахини", 595, 17, 53, 21],
      ["Цельнозерновой хлеб", 247, 9.4, 3.3, 41.2],
      ["Тортилья кукурузная", 218, 5.7, 2.9, 44],
      ["Ореховая паста кешью", 553, 18, 44, 30]
    ]
  }
];

const mealLibrary = {
  [mealTypes.breakfast]: [
    ["Овсянка с ягодами", 320, 402, 16, 9, 63, "Сложные углеводы и ровный старт дня"],
    ["Омлет с овощами", 280, 356, 28, 20, 12, "Плотный белковый завтрак"],
    ["Греческий йогурт с гранолой", 260, 334, 19, 8, 46, "Быстрый завтрак на каждый день"],
    ["Творог с бананом", 300, 312, 27, 8, 31, "Хорошо закрывает белок"],
    ["Сэндвич с индейкой", 290, 378, 24, 11, 42, "Сытный старт без перегруза"],
    ["Рисовая каша с яблоком", 330, 344, 10, 6, 59, "Мягкий углеводный вариант"]
  ],
  [mealTypes.lunch]: [
    ["Курица с рисом и брокколи", 380, 612, 44, 17, 66, "Классический сбалансированный обед"],
    ["Лосось с киноа", 340, 588, 37, 24, 49, "Жирные кислоты и хороший белок"],
    ["Говядина с гречкой", 410, 642, 41, 23, 58, "Сытный вариант на активный день"],
    ["Индейка с булгуром", 360, 564, 39, 14, 63, "Ровный баланс КБЖУ"],
    ["Паста с тунцом", 350, 592, 35, 16, 69, "Восстановление после нагрузки"],
    ["Тофу с овощами и рисом", 370, 498, 28, 14, 60, "Легкий и насыщенный обед"]
  ],
  [mealTypes.dinner]: [
    ["Треска с овощами", 310, 402, 34, 12, 28, "Легкий вечерний прием пищи"],
    ["Творожная запеканка fit", 290, 366, 29, 13, 24, "Белковый ужин"],
    ["Салат с курицей и авокадо", 320, 438, 31, 24, 16, "Низкоуглеводный вариант"],
    ["Омлет с сыром и шпинатом", 280, 348, 27, 21, 8, "Хорошо закрывает белок вечером"],
    ["Индейка с бататом", 330, 472, 33, 13, 44, "Умеренные углеводы на ужин"],
    ["Рыба с картофелем", 360, 454, 32, 12, 38, "Спокойный вечерний баланс"]
  ],
  [mealTypes.snack]: [
    ["Йогурт и орехи", 180, 286, 15, 17, 18, "Быстрый перекус между делами"],
    ["Протеиновый батончик и кофе", 95, 204, 18, 6, 17, "Удобный офисный вариант"],
    ["Банан и кефир", 250, 214, 8, 2, 40, "Углеводы перед активностью"],
    ["Творожный мусс", 170, 198, 19, 7, 11, "Белковый перекус"],
    ["Хумус с овощами", 220, 242, 8, 11, 24, "Насыщает надолго"],
    ["Яблоко и арахисовая паста", 160, 216, 5, 11, 25, "Сладкий перекус без срыва"]
  ]
};

function getUserByEmail(email) {
  return db.prepare(`SELECT id, email, role FROM users WHERE email = ?`).get(email);
}

function createSampleUsers() {
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password_hash, role, created_at)
    VALUES (?, ?, ?, 'user', ?)
  `);
  const insertGoal = db.prepare(`
    INSERT OR IGNORE INTO goals (user_id, calories, protein, fat, carbs, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const now = getTimestamp();

  for (let index = 1; index <= BULK_SEED_CONFIG.sampleUsers; index += 1) {
    const email = `sample.user${String(index).padStart(2, "0")}@nutritrack.local`;
    const name = `Sample User ${String(index).padStart(2, "0")}`;

    insertUser.run(name, email, hashPassword(`Sample${index}Pass!`), now);

    const user = getUserByEmail(email);
    insertGoal.run(
      user.id,
      1800 + index * 95,
      105 + index * 7,
      55 + index * 3,
      175 + index * 15,
      now
    );
  }
}

function ensureProductCatalog() {
  const adminId = getUserByEmail(adminUser.email)?.id;
  const now = getTimestamp();
  const existingNames = new Set(
    db.prepare(`SELECT name FROM products`).all().map((product) => product.name)
  );
  const insertProduct = db.prepare(`
    INSERT INTO products (
      name, brand, category, calories, protein, fat, carbs, created_by, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  productBlueprints.forEach((blueprint, blueprintIndex) => {
    blueprint.items.forEach(([name, calories, protein, fat, carbs], itemIndex) => {
      if (existingNames.has(name)) {
        return;
      }

      const brand = `${blueprint.brand} ${String(((blueprintIndex + itemIndex) % 4) + 1)}`;
      insertProduct.run(
        name,
        brand,
        blueprint.category,
        calories,
        protein,
        fat,
        carbs,
        adminId,
        now,
        now
      );
      existingNames.add(name);
    });
  });
}

function buildMealVariant(mealType, templateIndex, offsetSeed) {
  const templates = mealLibrary[mealType];
  const [title, grams, calories, protein, fat, carbs, notes] =
    templates[templateIndex % templates.length];
  const modifier = ((offsetSeed % 5) - 2) * 0.04;

  return {
    title,
    grams: Math.max(90, Math.round(grams * (1 + modifier))),
    calories: Number((calories * (1 + modifier)).toFixed(1)),
    protein: Number((protein * (1 + modifier / 2)).toFixed(1)),
    fat: Number((fat * (1 + modifier / 2)).toFixed(1)),
    carbs: Number((carbs * (1 + modifier / 2)).toFixed(1)),
    notes
  };
}

function ensureMealsForUser(userId, daysBack, dailyPlan, noteSuffix) {
  const insertMeal = db.prepare(`
    INSERT INTO meals (
      user_id, title, meal_type, entry_date, eaten_at, grams,
      calories, protein, fat, carbs, notes, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const today = getLocalDate();

  for (let dayOffset = daysBack - 1; dayOffset >= 0; dayOffset -= 1) {
    const date = addDays(today, -dayOffset);
    const existingMealTypes = new Set(
      db
        .prepare(`SELECT meal_type FROM meals WHERE user_id = ? AND entry_date = ?`)
        .all(userId, date)
        .map((item) => item.meal_type)
    );

    dailyPlan.forEach((entry, planIndex) => {
      if (existingMealTypes.has(entry.mealType)) {
        return;
      }

      const meal = buildMealVariant(
        entry.mealType,
        dayOffset + userId + planIndex,
        dayOffset + planIndex
      );
      const createdAt = `${date}T${entry.time}:00.000Z`;

      insertMeal.run(
        userId,
        meal.title,
        entry.mealType,
        date,
        entry.time,
        meal.grams,
        meal.calories,
        meal.protein,
        meal.fat,
        meal.carbs,
        `${meal.notes}. ${noteSuffix}`,
        createdAt,
        createdAt
      );
    });
  }
}

function ensureHydrationForUser(userId, daysBack, plan) {
  const insertHydration = db.prepare(`
    INSERT INTO hydration_logs (user_id, amount_ml, entry_date, logged_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const today = getLocalDate();

  for (let dayOffset = daysBack - 1; dayOffset >= 0; dayOffset -= 1) {
    const date = addDays(today, -dayOffset);
    const existingTimes = new Set(
      db
        .prepare(`SELECT logged_at FROM hydration_logs WHERE user_id = ? AND entry_date = ?`)
        .all(userId, date)
        .map((item) => item.logged_at)
    );

    plan.forEach((entry, planIndex) => {
      if (existingTimes.has(entry.time)) {
        return;
      }

      const createdAt = `${date}T${entry.time}:00.000Z`;
      const amountMl = entry.amountMl + ((dayOffset + planIndex) % 3) * 50;
      insertHydration.run(userId, amountMl, date, entry.time, createdAt);
    });
  }
}

function ensureTemplatesForUser(userId, targetCount) {
  const existingNames = new Set(
    db
      .prepare(`SELECT name FROM meal_templates WHERE user_id = ?`)
      .all(userId)
      .map((template) => template.name)
  );
  const insertTemplate = db.prepare(`
    INSERT INTO meal_templates (
      user_id, name, meal_type, grams, calories, protein, fat, carbs, notes, usage_count, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const allMealTypes = Object.values(mealTypes);
  const now = getTimestamp();
  let created = existingNames.size;
  let cursor = 0;

  while (created < targetCount) {
    const mealType = allMealTypes[cursor % allMealTypes.length];
    const meal = buildMealVariant(mealType, cursor, cursor);
    const name = `${meal.title} · plan ${String(cursor + 1).padStart(2, "0")}`;

    if (!existingNames.has(name)) {
      insertTemplate.run(
        userId,
        name,
        mealType,
        meal.grams,
        meal.calories,
        meal.protein,
        meal.fat,
        meal.carbs,
        `${meal.notes}. Bulk template seed.`,
        (cursor % 7) + 1,
        now,
        now
      );
      existingNames.add(name);
      created += 1;
    }

    cursor += 1;
  }
}

function buildMealPlan(userIndex) {
  const breakfastTime = userIndex % 3 === 0 ? "07:40" : "08:00";
  const lunchTime = userIndex % 4 === 0 ? "12:40" : "13:00";
  const dinnerTime = userIndex % 2 === 0 ? "19:10" : "19:40";
  const hasSnack = userIndex % 3 !== 1;

  return [
    { mealType: mealTypes.breakfast, time: breakfastTime },
    { mealType: mealTypes.lunch, time: lunchTime },
    ...(hasSnack ? [{ mealType: mealTypes.snack, time: "16:10" }] : []),
    { mealType: mealTypes.dinner, time: dinnerTime }
  ];
}

function buildHydrationPlan(userIndex) {
  const plan = [
    { time: "07:50", amountMl: 300 },
    { time: "11:30", amountMl: 350 },
    { time: "15:20", amountMl: 300 },
    { time: "20:10", amountMl: 400 }
  ];

  if (userIndex % 2 === 0) {
    plan.splice(2, 0, { time: "13:45", amountMl: 250 });
  }

  return plan;
}

function ensureBodyMetricsForUser(userId, daysBack, baseWeight) {
  const existingDates = new Set(
    db
      .prepare(`SELECT entry_date FROM body_metrics WHERE user_id = ?`)
      .all(userId)
      .map((entry) => entry.entry_date)
  );
  const insertMetric = db.prepare(`
    INSERT INTO body_metrics (
      user_id, entry_date, weight_kg, body_fat, waist_cm, chest_cm, notes, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let index = daysBack - 1; index >= 0; index -= 1) {
    const date = addDays(getLocalDate(), -(index * 7));

    if (existingDates.has(date)) {
      continue;
    }

    const weightKg = Number((baseWeight - (daysBack - index) * 0.15).toFixed(1));
    const bodyFat = Number((18 + ((userId + index) % 4) * 0.4).toFixed(1));
    const waistCm = Number((82 + ((userId + index) % 5) * 0.5).toFixed(1));
    const chestCm = Number((100 + ((userId + index) % 3) * 0.7).toFixed(1));

    insertMetric.run(
      userId,
      date,
      weightKg,
      bodyFat,
      waistCm,
      chestCm,
      "Bulk body-metrics seed.",
      `${date}T07:30:00.000Z`
    );
  }
}

function ensurePlannerForUser(userId, startDate, daysCount, userIndex) {
  const insertPlan = db.prepare(`
    INSERT INTO meal_plans (
      user_id, entry_date, meal_type, title, target_calories, target_protein,
      target_fat, target_carbs, planned_time, completed, linked_template_id, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const existingKeys = new Set(
    db
      .prepare(`SELECT entry_date, meal_type, planned_time FROM meal_plans WHERE user_id = ?`)
      .all(userId)
      .map((entry) => `${entry.entry_date}|${entry.meal_type}|${entry.planned_time}`)
  );
  const templates = db
    .prepare(`SELECT id, name, meal_type, calories, protein, fat, carbs FROM meal_templates WHERE user_id = ?`)
    .all(userId);

  for (let index = 0; index < daysCount; index += 1) {
    const date = addDays(startDate, index);
    const plan = buildMealPlan(userIndex + index);

    plan.forEach((entry, planIndex) => {
      const key = `${date}|${entry.mealType}|${entry.time}`;

      if (existingKeys.has(key)) {
        return;
      }

      const template = templates[(index + planIndex) % Math.max(templates.length, 1)] || null;
      const calories = 320 + ((index + planIndex) % 5) * 70;
      const protein = 18 + ((index + planIndex) % 4) * 8;
      const fat = 9 + ((index + planIndex) % 4) * 3;
      const carbs = 24 + ((index + planIndex) % 4) * 11;

      insertPlan.run(
        userId,
        date,
        entry.mealType,
        template?.name || `${entry.mealType} plan ${index + 1}`,
        template?.calories || calories,
        template?.protein || protein,
        template?.fat || fat,
        template?.carbs || carbs,
        entry.time,
        index === 0 && planIndex === 0 ? 1 : 0,
        template?.id || null,
        `${date}T06:00:00.000Z`,
        `${date}T06:00:00.000Z`
      );
    });
  }
}

function ensureShoppingForUser(userId, userIndex) {
  const existingTitles = new Set(
    db
      .prepare(`SELECT title FROM shopping_items WHERE user_id = ?`)
      .all(userId)
      .map((entry) => entry.title)
  );
  const insertItem = db.prepare(`
    INSERT INTO shopping_items (
      user_id, title, category, quantity, unit, planned_for, source, notes, is_checked, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const today = getLocalDate();
  const suggestions = [
    ["Греческий йогурт", "Белковые продукты", 4, "шт"],
    ["Овсяные хлопья", "Крупы и гарниры", 1, "уп"],
    ["Брокколи", "Овощи", 2, "уп"],
    ["Бананы", "Фрукты", 6, "шт"],
    ["Кефир 1%", "Напитки", 2, "шт"]
  ];

  suggestions.forEach((item, index) => {
    const title = `${item[0]} ${userIndex + 1}`;

    if (existingTitles.has(title)) {
      return;
    }

    insertItem.run(
      userId,
      title,
      item[1],
      item[2],
      item[3],
      today,
      "bulk-seed",
      "Автоматически добавлено для пользовательского сценария закупки.",
      index === 0 ? 1 : 0,
      `${today}T09:00:00.000Z`,
      `${today}T09:00:00.000Z`
    );
  });
}

function collectStats() {
  const tables = [
    "users",
    "goals",
    "products",
    "meals",
    "hydration_logs",
    "meal_templates",
    "daily_checkins",
    "body_metrics",
    "meal_plans",
    "shopping_items"
  ];
  const stats = Object.fromEntries(
    tables.map((table) => [
      table,
      db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count
    ])
  );

  const demoUserId = getUserByEmail(demoUser.email)?.id;
  const range = db
    .prepare(`SELECT MIN(entry_date) AS firstDate, MAX(entry_date) AS lastDate FROM meals`)
    .get();

  stats.range = range;
  stats.demoUser = {
    meals: db
      .prepare(`SELECT COUNT(*) AS count FROM meals WHERE user_id = ?`)
      .get(demoUserId).count,
    hydration: db
      .prepare(`SELECT COUNT(*) AS count FROM hydration_logs WHERE user_id = ?`)
      .get(demoUserId).count,
    templates: db
      .prepare(`SELECT COUNT(*) AS count FROM meal_templates WHERE user_id = ?`)
      .get(demoUserId).count,
    checkins: db
      .prepare(`SELECT COUNT(*) AS count FROM daily_checkins WHERE user_id = ?`)
      .get(demoUserId).count,
    metrics: db
      .prepare(`SELECT COUNT(*) AS count FROM body_metrics WHERE user_id = ?`)
      .get(demoUserId).count,
    plans: db
      .prepare(`SELECT COUNT(*) AS count FROM meal_plans WHERE user_id = ?`)
      .get(demoUserId).count,
    shopping: db
      .prepare(`SELECT COUNT(*) AS count FROM shopping_items WHERE user_id = ?`)
      .get(demoUserId).count
  };

  return stats;
}

function main() {
  initializeDatabase();
  createSampleUsers();
  ensureProductCatalog();

  const users = db
    .prepare(`SELECT id, email FROM users WHERE role = 'user' ORDER BY id ASC`)
    .all();
  const demo = users.find((user) => user.email === demoUser.email);
  const others = users.filter((user) => user.email !== demoUser.email);

  const seedTransaction = db.transaction(() => {
    ensureMealsForUser(
      demo.id,
      BULK_SEED_CONFIG.demoHistoryDays,
      [
        { mealType: mealTypes.breakfast, time: "08:10" },
        { mealType: mealTypes.lunch, time: "13:05" },
        { mealType: mealTypes.snack, time: "17:10" },
        { mealType: mealTypes.dinner, time: "20:05" }
      ],
      "Demo history seed."
    );
    ensureHydrationForUser(demo.id, BULK_SEED_CONFIG.demoHistoryDays, [
      { time: "07:45", amountMl: 300 },
      { time: "10:30", amountMl: 250 },
      { time: "11:20", amountMl: 400 },
      { time: "15:40", amountMl: 350 },
      { time: "20:15", amountMl: 450 }
    ]);
    ensureTemplatesForUser(demo.id, BULK_SEED_CONFIG.demoTemplateCount);
    seedWellbeingRange(demo.id, getLocalDate(), BULK_SEED_CONFIG.demoHistoryDays);
    ensureBodyMetricsForUser(demo.id, BULK_SEED_CONFIG.demoMetricCount, 81.4);
    ensurePlannerForUser(demo.id, getLocalDate(), BULK_SEED_CONFIG.plannerDays, 0);
    ensureShoppingForUser(demo.id, 0);

    others.forEach((user, index) => {
      ensureMealsForUser(
        user.id,
        BULK_SEED_CONFIG.sampleHistoryDays,
        buildMealPlan(index),
        "Sample history seed."
      );
      ensureHydrationForUser(
        user.id,
        BULK_SEED_CONFIG.sampleHistoryDays,
        buildHydrationPlan(index)
      );
      ensureTemplatesForUser(user.id, BULK_SEED_CONFIG.sampleTemplateCount);
      seedWellbeingRange(user.id, getLocalDate(), BULK_SEED_CONFIG.sampleHistoryDays);
      ensureBodyMetricsForUser(
        user.id,
        BULK_SEED_CONFIG.sampleMetricCount,
        86 + index * 1.4
      );
      ensurePlannerForUser(user.id, getLocalDate(), BULK_SEED_CONFIG.plannerDays, index + 1);
      ensureShoppingForUser(user.id, index + 1);
    });
  });

  seedTransaction();

  console.log("Bulk seed completed.");
  console.log(
    JSON.stringify(
      {
        config: BULK_SEED_CONFIG,
        stats: collectStats()
      },
      null,
      2
    )
  );

  db.close();
}

main();
