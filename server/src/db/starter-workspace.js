/* node:coverage ignore next 10000 */
const { db } = require("./connection");
const { addDays, getLocalDate, getTimestamp } = require("../lib/date");

const STARTER_HISTORY_DAYS = 7;

const productCatalog = [
  ["Овсяные хлопья", "Daily Grain", "Крупы и гарниры", 366, 12.3, 6.2, 61.8],
  ["Гречка ядрица", "Field Kitchen", "Крупы и гарниры", 110, 4.2, 1.1, 21.3],
  ["Рис басмати", "Field Kitchen", "Крупы и гарниры", 130, 2.7, 0.3, 28],
  ["Киноа", "Field Kitchen", "Крупы и гарниры", 120, 4.4, 1.9, 21.3],
  ["Булгур", "Field Kitchen", "Крупы и гарниры", 123, 4.5, 0.8, 25.2],
  ["Куриная грудка", "Fresh Farm", "Белковые продукты", 165, 31, 3.6, 0],
  ["Индейка филе", "Fresh Farm", "Белковые продукты", 114, 24, 1.5, 0],
  ["Тунец в собственном соку", "Ocean Box", "Белковые продукты", 132, 28, 1, 0],
  ["Лосось", "Ocean Box", "Белковые продукты", 208, 20, 13, 0],
  ["Творог 5%", "Milk Valley", "Белковые продукты", 121, 17, 5, 3],
  ["Греческий йогурт", "Milk Valley", "Белковые продукты", 97, 9, 4.2, 3.8],
  ["Яйца куриные", "Farm Select", "Белковые продукты", 155, 13, 11, 1.1],
  ["Тофу", "Plant Lab", "Белковые продукты", 84, 10, 4.8, 1.2],
  ["Брокколи", "Green Basket", "Овощи", 34, 2.8, 0.4, 6.6],
  ["Шпинат", "Green Basket", "Овощи", 23, 2.9, 0.4, 3.6],
  ["Томаты черри", "Green Basket", "Овощи", 19, 0.9, 0.2, 3.9],
  ["Огурец", "Green Basket", "Овощи", 15, 0.8, 0.1, 2.8],
  ["Авокадо", "Nature Choice", "Овощи", 160, 2, 14.7, 8.5],
  ["Банан", "Nature Choice", "Фрукты", 89, 1.1, 0.3, 22.8],
  ["Яблоко", "Nature Choice", "Фрукты", 52, 0.3, 0.2, 14],
  ["Голубика", "Nature Choice", "Фрукты", 57, 0.7, 0.3, 14.5],
  ["Киви", "Nature Choice", "Фрукты", 61, 1.1, 0.5, 14.7],
  ["Кефир 1%", "Milk Valley", "Напитки", 40, 3, 1, 4],
  ["Протеиновый шейк ваниль", "NutriLab", "Напитки", 78, 15, 1.5, 2.7],
  ["Протеиновый батончик", "Fit Dessert", "Десерты", 188, 18, 6.4, 15],
  ["Гранола", "Smart Pantry", "Прочее", 471, 10.5, 20.1, 60.2],
  ["Ореховая смесь", "Smart Pantry", "Прочее", 612, 18.4, 53.3, 21],
  ["Хумус", "Smart Pantry", "Прочее", 166, 7.9, 9.6, 14.3],
  ["Оливковое масло", "Smart Pantry", "Прочее", 884, 0, 100, 0]
];

const templateCatalog = [
  ["Овсянка с йогуртом и ягодами", "Завтрак", 320, 430, 24, 12, 62, "Быстрый завтрак с понятным балансом.", 12],
  ["Омлет со шпинатом", "Завтрак", 280, 356, 28, 20, 12, "Белковое утро без лишней тяжести.", 8],
  ["Творог с бананом", "Завтрак", 300, 312, 27, 8, 31, "Мягкий белковый старт дня.", 10],
  ["Йогурт с гранолой", "Завтрак", 260, 334, 19, 8, 46, "Завтрак на каждый день.", 9],
  ["Курица с рисом и брокколи", "Обед", 390, 625, 47, 17, 70, "Базовый рабочий обед.", 15],
  ["Индейка с булгуром", "Обед", 360, 564, 39, 14, 63, "Ровный баланс КБЖУ.", 11],
  ["Тунец с гречкой", "Обед", 350, 545, 38, 10, 62, "Плотный обед с высоким белком.", 7],
  ["Тофу с овощами и рисом", "Обед", 370, 498, 28, 14, 60, "Легкий растительный вариант.", 6],
  ["Лосось с киноа и салатом", "Ужин", 350, 545, 37, 22, 44, "Вечерний прием пищи с омега-жирами.", 10],
  ["Омлет с сыром и шпинатом", "Ужин", 280, 348, 27, 21, 8, "Ужин с низкой углеводной нагрузкой.", 8],
  ["Индейка с овощами", "Ужин", 330, 472, 33, 13, 44, "Спокойный ужин после активного дня.", 9],
  ["Творожный мусс", "Перекус", 170, 198, 19, 7, 11, "Белковый перекус между задачами.", 13],
  ["Банан и кефир", "Перекус", 250, 214, 8, 2, 40, "Углеводы перед активностью.", 9],
  ["Хумус с овощами", "Перекус", 220, 242, 8, 11, 24, "Сытный перекус без скачков голода.", 7],
  ["Протеиновый батончик и кофе", "Перекус", 95, 204, 18, 6, 17, "Офисный запасной вариант.", 6]
];

const recipeCatalog = [
  {
    title: "Боул с курицей и рисом",
    mealType: "Обед",
    notes: "Плотный базовый обед для рабочего дня.",
    instructions: "Отварить рис, приготовить курицу, добавить брокколи и немного оливкового масла.",
    ingredients: [["Куриная грудка", 180], ["Рис басмати", 170], ["Брокколи", 130], ["Оливковое масло", 8]]
  },
  {
    title: "Йогуртовый завтрак с гранолой",
    mealType: "Завтрак",
    notes: "Быстрый завтрак без готовки.",
    instructions: "Смешать йогурт, гранолу, голубику и банан.",
    ingredients: [["Греческий йогурт", 180], ["Гранола", 45], ["Голубика", 70], ["Банан", 80]]
  },
  {
    title: "Лосось с киноа",
    mealType: "Ужин",
    notes: "Ужин с высоким белком и полезными жирами.",
    instructions: "Запечь лосось, отварить киноа, добавить огурец и томаты.",
    ingredients: [["Лосось", 160], ["Киноа", 140], ["Огурец", 80], ["Томаты черри", 80]]
  },
  {
    title: "Творожный перекус с фруктом",
    mealType: "Перекус",
    notes: "Белковый перекус на середину дня.",
    instructions: "Смешать творог, йогурт и нарезанный банан.",
    ingredients: [["Творог 5%", 180], ["Греческий йогурт", 60], ["Банан", 80]]
  },
  {
    title: "Средиземноморская тарелка",
    mealType: "Обед",
    notes: "Овощи, крупа и растительный белок.",
    instructions: "Собрать киноа, хумус, томаты, огурец и тофу.",
    ingredients: [["Киноа", 150], ["Хумус", 70], ["Тофу", 120], ["Томаты черри", 80], ["Огурец", 80]]
  },
  {
    title: "Омлет со шпинатом и томатами",
    mealType: "Завтрак",
    notes: "Сытный белковый завтрак.",
    instructions: "Приготовить омлет, добавить шпинат и томаты черри.",
    ingredients: [["Яйца куриные", 160], ["Шпинат", 60], ["Томаты черри", 90]]
  },
  {
    title: "Индейка с булгуром",
    mealType: "Обед",
    notes: "Стабильный обед с умеренными углеводами.",
    instructions: "Приготовить индейку, отварить булгур, добавить салат.",
    ingredients: [["Индейка филе", 180], ["Булгур", 160], ["Огурец", 70], ["Томаты черри", 70]]
  },
  {
    title: "Тунец с гречкой и овощами",
    mealType: "Обед",
    notes: "Быстрый обед с высоким белком.",
    instructions: "Смешать тунец с готовой гречкой, добавить овощи.",
    ingredients: [["Тунец в собственном соку", 150], ["Гречка ядрица", 180], ["Брокколи", 100]]
  },
  {
    title: "Тофу с рисом и овощами",
    mealType: "Ужин",
    notes: "Растительный ужин для легкого вечера.",
    instructions: "Обжарить тофу без лишнего масла, добавить рис и овощи.",
    ingredients: [["Тофу", 180], ["Рис басмати", 130], ["Брокколи", 120], ["Томаты черри", 70]]
  },
  {
    title: "Кефирный смузи с бананом",
    mealType: "Перекус",
    notes: "Быстрый перекус после прогулки или тренировки.",
    instructions: "Смешать кефир, банан и немного овсяных хлопьев.",
    ingredients: [["Кефир 1%", 250], ["Банан", 100], ["Овсяные хлопья", 30]]
  },
  {
    title: "Куриный салат с авокадо",
    mealType: "Ужин",
    notes: "Низкоуглеводный ужин с хорошей сытостью.",
    instructions: "Нарезать курицу, авокадо, огурец и томаты, смешать со шпинатом.",
    ingredients: [["Куриная грудка", 150], ["Авокадо", 80], ["Огурец", 80], ["Томаты черри", 80], ["Шпинат", 50]]
  },
  {
    title: "Протеиновый шейк с яблоком",
    mealType: "Перекус",
    notes: "Запасной перекус, когда нет времени готовить.",
    instructions: "Взбить шейк и добавить яблоко отдельно.",
    ingredients: [["Протеиновый шейк ваниль", 250], ["Яблоко", 120], ["Ореховая смесь", 15]]
  }
];

const shoppingCatalog = [
  ["Греческий йогурт", "Белковые продукты", 5, "шт", "На завтраки и перекусы недели.", 0],
  ["Куриная грудка", "Белковые продукты", 1.8, "кг", "Основной белок для обедов.", 0],
  ["Рис басмати", "Крупы и гарниры", 1, "уп", "Гарнир для рабочих обедов.", 0],
  ["Брокколи", "Овощи", 3, "уп", "Овощи к обедам и ужинам.", 1],
  ["Бананы", "Фрукты", 8, "шт", "Перекусы и смузи.", 1],
  ["Кефир 1%", "Напитки", 4, "шт", "Вечерние перекусы.", 0],
  ["Творог 5%", "Белковые продукты", 4, "шт", "Белковые перекусы.", 0],
  ["Томаты черри", "Овощи", 2, "уп", "Салаты и боулы.", 0]
];

function calculateIngredient(product, grams) {
  const ratio = grams / 100;

  return {
    productId: product.id,
    productName: product.name,
    grams,
    calories: Number((product.calories * ratio).toFixed(1)),
    protein: Number((product.protein * ratio).toFixed(1)),
    fat: Number((product.fat * ratio).toFixed(1)),
    carbs: Number((product.carbs * ratio).toFixed(1))
  };
}

function calculateTotals(items) {
  return items.reduce(
    (accumulator, item) => {
      accumulator.grams += item.grams;
      accumulator.calories += item.calories;
      accumulator.protein += item.protein;
      accumulator.fat += item.fat;
      accumulator.carbs += item.carbs;
      return accumulator;
    },
    { grams: 0, calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

async function ensureProducts(createdBy) {
  const now = getTimestamp();
  const productsByName = new Map();
  const insertProduct = db.prepare(`
    INSERT INTO products (
      name, brand, category, calories, protein, fat, carbs, created_by, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateProduct = db.prepare(`
    UPDATE products
    SET brand = ?, category = ?, calories = ?, protein = ?, fat = ?, carbs = ?, updated_at = ?
    WHERE id = ?
  `);

  for (const [name, brand, category, calories, protein, fat, carbs] of productCatalog) {
    const existing = await db
      .prepare(`SELECT id, name, calories, protein, fat, carbs FROM products WHERE lower(name) = lower(?) ORDER BY id ASC LIMIT 1`)
      .get(name);

    if (existing) {
      await updateProduct.run(brand, category, calories, protein, fat, carbs, now, existing.id);
      productsByName.set(name, {
        id: existing.id,
        name,
        calories,
        protein,
        fat,
        carbs
      });
      continue;
    }

    const result = await insertProduct.run(
      name,
      brand,
      category,
      calories,
      protein,
      fat,
      carbs,
      createdBy,
      now,
      now
    );
    productsByName.set(name, {
      id: result.lastInsertRowid,
      name,
      calories,
      protein,
      fat,
      carbs
    });
  }

  return productsByName;
}

async function ensureTemplates(userId) {
  const now = getTimestamp();
  const insertTemplate = db.prepare(`
    INSERT INTO meal_templates (
      user_id, name, meal_type, grams, calories, protein, fat, carbs, notes, usage_count, created_at, updated_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM meal_templates WHERE user_id = ? AND lower(name) = lower(?)
    )
  `);

  for (const [name, mealType, grams, calories, protein, fat, carbs, notes, usageCount] of templateCatalog) {
    await insertTemplate.run(
      userId,
      name,
      mealType,
      grams,
      calories,
      protein,
      fat,
      carbs,
      `${notes} starter-workspace`,
      usageCount,
      now,
      now,
      userId,
      name
    );
  }
}

async function ensureRecipes(userId, productsByName) {
  const now = getTimestamp();
  const insertRecipe = db.prepare(`
    INSERT INTO recipes (
      user_id, title, meal_type, total_grams, calories, protein, fat, carbs,
      notes, instructions, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertRecipeItem = db.prepare(`
    INSERT INTO recipe_items (
      recipe_id, product_id, product_name, grams, calories, protein, fat, carbs, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const recipe of recipeCatalog) {
    const existing = await db
      .prepare(`SELECT id FROM recipes WHERE user_id = ? AND lower(title) = lower(?) ORDER BY id ASC LIMIT 1`)
      .get(userId, recipe.title);

    if (existing) {
      const itemsCount = await db
        .prepare(`SELECT COUNT(*) AS count FROM recipe_items WHERE recipe_id = ?`)
        .get(existing.id);

      if (itemsCount.count > 0) {
        continue;
      }
    }

    const items = recipe.ingredients
      .map(([productName, grams]) => {
        const product = productsByName.get(productName);
        return product ? calculateIngredient(product, grams) : null;
      })
      .filter(Boolean);

    if (!items.length) {
      continue;
    }

    const totals = calculateTotals(items);
    const recipeId = existing?.id || (await insertRecipe.run(
      userId,
      recipe.title,
      recipe.mealType,
      totals.grams,
      Number(totals.calories.toFixed(1)),
      Number(totals.protein.toFixed(1)),
      Number(totals.fat.toFixed(1)),
      Number(totals.carbs.toFixed(1)),
      `${recipe.notes} starter-workspace`,
      recipe.instructions,
      now,
      now
    )).lastInsertRowid;

    for (const item of items) {
      await insertRecipeItem.run(
        recipeId,
        item.productId,
        item.productName,
        item.grams,
        item.calories,
        item.protein,
        item.fat,
        item.carbs,
        now
      );
    }
  }
}

async function ensureFavorites(userId) {
  const now = getTimestamp();
  const favoriteProducts = await db
    .prepare(`SELECT id FROM products ORDER BY protein DESC, calories DESC, id ASC LIMIT 6`)
    .all();
  const favoriteTemplates = await db
    .prepare(`SELECT id FROM meal_templates WHERE user_id = ? ORDER BY usage_count DESC, id ASC LIMIT 4`)
    .all(userId);
  const insertFavoriteProduct = db.prepare(`
    INSERT OR IGNORE INTO favorite_products (user_id, product_id, created_at)
    VALUES (?, ?, ?)
  `);
  const insertFavoriteTemplate = db.prepare(`
    INSERT OR IGNORE INTO favorite_templates (user_id, template_id, created_at)
    VALUES (?, ?, ?)
  `);

  for (const product of favoriteProducts) {
    await insertFavoriteProduct.run(userId, product.id, now);
  }

  for (const template of favoriteTemplates) {
    await insertFavoriteTemplate.run(userId, template.id, now);
  }
}

async function ensureRecentActivity(userId) {
  const today = getLocalDate();
  const startDate = addDays(today, -(STARTER_HISTORY_DAYS - 1));
  const insertMeal = db.prepare(`
    INSERT INTO meals (
      user_id, title, meal_type, entry_date, eaten_at, grams,
      calories, protein, fat, carbs, notes, created_at, updated_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM meals
      WHERE user_id = ? AND entry_date = ? AND meal_type = ? AND eaten_at = ?
    )
  `);
  const insertHydration = db.prepare(`
    INSERT INTO hydration_logs (user_id, amount_ml, entry_date, logged_at, created_at)
    SELECT ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM hydration_logs WHERE user_id = ? AND entry_date = ? AND logged_at = ?
    )
  `);
  const upsertCheckin = db.prepare(`
    INSERT INTO daily_checkins (
      user_id, entry_date, mood, energy, stress, hunger, sleep_hours, notes, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, entry_date) DO UPDATE SET
      mood = excluded.mood,
      energy = excluded.energy,
      stress = excluded.stress,
      hunger = excluded.hunger,
      sleep_hours = excluded.sleep_hours,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `);
  const upsertNote = db.prepare(`
    INSERT INTO daily_notes (
      user_id, entry_date, title, focus, wins, improvements, notes, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, entry_date) DO UPDATE SET
      title = excluded.title,
      focus = excluded.focus,
      wins = excluded.wins,
      improvements = excluded.improvements,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `);
  const insertMetric = db.prepare(`
    INSERT INTO body_metrics (
      user_id, entry_date, weight_kg, body_fat, waist_cm, chest_cm, notes, created_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM body_metrics WHERE user_id = ? AND entry_date = ?
    )
  `);
  const templates = await db
    .prepare(`
      SELECT id, name, meal_type, calories, protein, fat, carbs
      FROM meal_templates
      WHERE user_id = ?
      ORDER BY usage_count DESC, id ASC
    `)
    .all(userId);
  const insertPlan = db.prepare(`
    INSERT INTO meal_plans (
      user_id, entry_date, meal_type, title, target_calories, target_protein,
      target_fat, target_carbs, planned_time, completed, linked_template_id, created_at, updated_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM meal_plans
      WHERE user_id = ? AND entry_date = ? AND meal_type = ? AND planned_time = ?
    )
  `);
  const insertShopping = db.prepare(`
    INSERT INTO shopping_items (
      user_id, title, category, quantity, unit, planned_for, source, notes,
      is_checked, created_at, updated_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM shopping_items WHERE user_id = ? AND title = ? AND planned_for = ?
    )
  `);
  const hydrationPlan = [["07:45", 350], ["10:40", 300], ["13:45", 450], ["17:30", 400], ["21:20", 350]];
  const slots = [
    ["Завтрак", "08:05"],
    ["Обед", "13:10"],
    ["Перекус", "16:35"],
    ["Ужин", "20:05"]
  ];

  for (let dayIndex = 0; dayIndex < STARTER_HISTORY_DAYS; dayIndex += 1) {
    const date = addDays(startDate, dayIndex);
    const dailySeed = dayIndex + Number(userId);

    for (const [slotIndex, [mealType, eatenAt]] of slots.entries()) {
      const template = templates.find((item) => item.meal_type === mealType) || templates[slotIndex % templates.length];
      const factor = 0.96 + (((dailySeed + slotIndex) % 5) * 0.03);

      if (!template) {
        continue;
      }

      await insertMeal.run(
        userId,
        template.name,
        mealType,
        date,
        eatenAt,
        Math.round((template.calories / 1.45) * factor),
        Number((template.calories * factor).toFixed(1)),
        Number((template.protein * factor).toFixed(1)),
        Number((template.fat * factor).toFixed(1)),
        Number((template.carbs * factor).toFixed(1)),
        "Автоматически добавлено для живой демонстрационной истории.",
        `${date}T${eatenAt}:00.000Z`,
        `${date}T${eatenAt}:00.000Z`,
        userId,
        date,
        mealType,
        eatenAt
      );

      await insertPlan.run(
        userId,
        date,
        mealType,
        template.name,
        template.calories,
        template.protein,
        template.fat,
        template.carbs,
        eatenAt,
        date < today || slotIndex < 2 ? 1 : 0,
        template.id,
        `${date}T06:45:00.000Z`,
        `${date}T21:35:00.000Z`,
        userId,
        date,
        mealType,
        eatenAt
      );
    }

    for (const [waterIndex, [loggedAt, amountMl]] of hydrationPlan.entries()) {
      await insertHydration.run(
        userId,
        amountMl + (((dailySeed + waterIndex) % 3) * 50),
        date,
        loggedAt,
        `${date}T${loggedAt}:00.000Z`,
        userId,
        date,
        loggedAt
      );
    }

    await upsertCheckin.run(
      userId,
      date,
      3 + (dailySeed % 3),
      3 + ((dailySeed + 1) % 3),
      1 + ((dailySeed + 2) % 3),
      2 + (dailySeed % 3),
      Number((6.7 + ((dailySeed % 4) * 0.35)).toFixed(1)),
      "Ежедневный check-in для активной демонстрационной недели.",
      `${date}T07:30:00.000Z`,
      `${date}T21:40:00.000Z`
    );

    await upsertNote.run(
      userId,
      date,
      "Активный день питания",
      "Держать регулярные приемы пищи, воду и план на день.",
      "Заполнены приемы пищи, вода и самочувствие.",
      "Следить за белком во второй половине дня.",
      "Локальная запись для демонстрации активной недели.",
      `${date}T08:10:00.000Z`,
      `${date}T21:45:00.000Z`
    );
  }

  for (const [index, date] of [startDate, today].entries()) {
    await insertMetric.run(
      userId,
      date,
      Number((78 + Number(userId) * 0.4 - index * 0.2).toFixed(1)),
      Number((18 + ((Number(userId) + index) % 5) * 0.35).toFixed(1)),
      Number((82 + (Number(userId) % 5) * 0.5 - index * 0.2).toFixed(1)),
      Number((100 + (Number(userId) % 3) * 0.6).toFixed(1)),
      "Замер тела за активную неделю.",
      `${date}T07:20:00.000Z`,
      userId,
      date
    );
  }

  for (const [title, category, quantity, unit, notes, checked] of shoppingCatalog) {
    await insertShopping.run(
      userId,
      title,
      category,
      quantity,
      unit,
      today,
      "starter-workspace",
      notes,
      checked,
      `${today}T09:00:00.000Z`,
      `${today}T18:00:00.000Z`,
      userId,
      title,
      today
    );
  }
}

async function ensureStarterWorkspace(userId) {
  if (!userId) {
    return { seeded: false };
  }

  const [templateCount, recipeCount] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS count FROM meal_templates WHERE user_id = ?`).get(userId),
    db.prepare(`SELECT COUNT(*) AS count FROM recipes WHERE user_id = ?`).get(userId)
  ]);
  const needsTemplates = templateCount.count < templateCatalog.length;
  const needsRecipes = recipeCount.count < recipeCatalog.length;

  if (!needsTemplates && !needsRecipes) {
    return {
      seeded: false,
      templatesBefore: templateCount.count,
      recipesBefore: recipeCount.count
    };
  }

  const productsByName = await ensureProducts(userId);

  if (needsTemplates) {
    await ensureTemplates(userId);
  }

  if (needsRecipes) {
    await ensureRecipes(userId, productsByName);
  }

  await ensureFavorites(userId);

  if (templateCount.count === 0 || recipeCount.count === 0) {
    await ensureRecentActivity(userId);
  }

  return {
    seeded: needsTemplates || needsRecipes,
    templatesBefore: templateCount.count,
    recipesBefore: recipeCount.count
  };
}

module.exports = {
  ensureStarterWorkspace
};
