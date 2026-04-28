const { Pool } = require("pg");

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (process.env.DB_PROVIDER === "postgres" || process.env.DB_HOST) {
    const host = process.env.DB_HOST || "127.0.0.1";
    const port = process.env.DB_PORT || "5432";
    const name = process.env.DB_NAME || "nutritrack";
    const user = encodeURIComponent(process.env.DB_USER || "nutritrack");
    const password = encodeURIComponent(process.env.DB_PASSWORD || "nutritrack");
    return `postgres://${user}:${password}@${host}:${port}/${name}`;
  }

  return "postgres://nutritrack:nutritrack@127.0.0.1:5432/nutritrack";
}

const databaseUrl = buildDatabaseUrl();
const baseDate = process.env.SEED_BASE_DATE || new Date().toISOString().slice(0, 10);

const products = [
  ["Овсяные хлопья", "Daily Grain", "Крупы и гарниры", 366, 12.3, 6.2, 61.8],
  ["Гречка ядрица", "Field Kitchen", "Крупы и гарниры", 110, 4.2, 1.1, 21.3],
  ["Рис басмати", "Field Kitchen", "Крупы и гарниры", 130, 2.7, 0.3, 28],
  ["Киноа", "Field Kitchen", "Крупы и гарниры", 120, 4.4, 1.9, 21.3],
  ["Булгур", "Field Kitchen", "Крупы и гарниры", 123, 4.5, 0.8, 25.2],
  ["Макароны из твердых сортов", "Field Kitchen", "Крупы и гарниры", 131, 5, 1.1, 25],
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
  ["Морковь", "Green Basket", "Овощи", 41, 0.9, 0.2, 9.6],
  ["Банан", "Nature Choice", "Фрукты", 89, 1.1, 0.3, 22.8],
  ["Яблоко", "Nature Choice", "Фрукты", 52, 0.3, 0.2, 14],
  ["Голубика", "Nature Choice", "Фрукты", 57, 0.7, 0.3, 14.5],
  ["Киви", "Nature Choice", "Фрукты", 61, 1.1, 0.5, 14.7],
  ["Кефир 1%", "Milk Valley", "Напитки", 40, 3, 1, 4],
  ["Протеиновый шейк ваниль", "NutriLab", "Напитки", 78, 15, 1.5, 2.7],
  ["Миндальное молоко", "Plant Lab", "Напитки", 24, 0.6, 1.1, 3.2],
  ["Комбуча", "Hydro Lab", "Напитки", 21, 0.2, 0, 4.8],
  ["Протеиновый батончик", "Fit Dessert", "Десерты", 188, 18, 6.4, 15],
  ["Творожный чизкейк fit", "Fit Dessert", "Десерты", 168, 14, 7, 12],
  ["Гранола", "Smart Pantry", "Прочее", 471, 10.5, 20.1, 60.2],
  ["Ореховая смесь", "Smart Pantry", "Прочее", 612, 18.4, 53.3, 21],
  ["Оливковое масло", "Smart Pantry", "Прочее", 884, 0, 100, 0],
  ["Хумус", "Smart Pantry", "Прочее", 166, 7.9, 9.6, 14.3]
];

const mealSeeds = [
  ["Завтрак", "08:10", "Овсянка с йогуртом и ягодами", 320, 430, 24, 12, 62],
  ["Обед", "13:05", "Курица с рисом и брокколи", 380, 620, 46, 16, 70],
  ["Перекус", "16:40", "Творог с бананом", 220, 310, 28, 8, 34],
  ["Ужин", "20:00", "Лосось с киноа и салатом", 340, 540, 36, 22, 44]
];

const templateSeeds = [
  ["Белковый завтрак", "Завтрак", 280, 390, 32, 12, 38, "Творог, йогурт, ягоды и гранола.", 7],
  ["Рабочий обед", "Обед", 390, 610, 44, 17, 68, "Курица или индейка с крупой и овощами.", 9],
  ["Легкий ужин", "Ужин", 320, 450, 34, 14, 36, "Рыба, овощи и немного гарнира.", 5],
  ["Быстрый перекус", "Перекус", 180, 260, 20, 8, 28, "Протеиновый батончик, фрукт или кефир.", 6],
  ["Восстановление после тренировки", "Перекус", 300, 420, 35, 9, 50, "Шейк плюс банан.", 4],
  ["Средиземноморская тарелка", "Обед", 360, 540, 30, 22, 52, "Киноа, овощи, хумус и белок.", 3]
];

const recipeSeeds = [
  {
    title: "Боул с курицей и рисом",
    mealType: "Обед",
    notes: "Базовый плотный обед.",
    instructions: "Отварить рис, приготовить курицу, добавить брокколи и немного оливкового масла.",
    ingredients: [["Куриная грудка", 180], ["Рис басмати", 170], ["Брокколи", 120]]
  },
  {
    title: "Йогуртовый завтрак с гранолой",
    mealType: "Завтрак",
    notes: "Быстрый завтрак.",
    instructions: "Смешать йогурт, гранолу, голубику и банан.",
    ingredients: [["Греческий йогурт", 180], ["Гранола", 45], ["Голубика", 70], ["Банан", 80]]
  },
  {
    title: "Лосось с киноа",
    mealType: "Ужин",
    notes: "Ужин с омега-жирами.",
    instructions: "Запечь лосось, отварить киноа, добавить овощной салат.",
    ingredients: [["Лосось", 160], ["Киноа", 140], ["Огурец", 70]]
  },
  {
    title: "Творожный перекус",
    mealType: "Перекус",
    notes: "Белковый перекус.",
    instructions: "Смешать творог, йогурт и фрукт.",
    ingredients: [["Творог 5%", 180], ["Греческий йогурт", 60], ["Банан", 80]]
  },
  {
    title: "Средиземноморская тарелка",
    mealType: "Обед",
    notes: "Овощи, крупа и растительный белок.",
    instructions: "Собрать киноа, хумус, томаты, огурец и тофу.",
    ingredients: [["Киноа", 150], ["Хумус", 70], ["Тофу", 120], ["Томаты черри", 80], ["Огурец", 80]]
  }
];

const shoppingSeeds = [
  ["Греческий йогурт", "Белковые продукты", 4, "шт", "На завтраки и перекусы.", false],
  ["Куриная грудка", "Белковые продукты", 1.5, "кг", "Основной белок на неделю.", false],
  ["Рис басмати", "Крупы и гарниры", 1, "уп", "Гарнир для обедов.", false],
  ["Гречка ядрица", "Крупы и гарниры", 1, "уп", "Запас круп.", false],
  ["Брокколи", "Овощи", 3, "уп", "Овощи к ужинам.", false],
  ["Банан", "Фрукты", 8, "шт", "Перекусы и смузи.", true],
  ["Кефир 1%", "Напитки", 3, "шт", "Вечерний перекус.", false],
  ["Ореховая смесь", "Прочее", 1, "уп", "Добавка к каше.", true],
  ["Томаты черри", "Овощи", 2, "уп", "Салаты.", false],
  ["Протеиновый батончик", "Десерты", 6, "шт", "Экстренные перекусы.", false]
];

function addDays(date, delta) {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + delta);
  return next.toISOString().slice(0, 10);
}

function round(value, digits = 1) {
  return Number(value.toFixed(digits));
}

async function cleanupBrokenDemo(client) {
  await client.query("DELETE FROM recipe_items WHERE recipe_id IN (SELECT id FROM recipes WHERE notes LIKE '%bulk-demo-seed%' OR title LIKE '%?%' OR meal_type LIKE '%?%')");
  await client.query("DELETE FROM recipes WHERE notes LIKE '%bulk-demo-seed%' OR title LIKE '%?%' OR meal_type LIKE '%?%'");
  await client.query("DELETE FROM favorite_templates WHERE template_id IN (SELECT id FROM meal_templates WHERE notes LIKE '%bulk-demo-seed%' OR name LIKE '%?%' OR meal_type LIKE '%?%')");
  await client.query("DELETE FROM meal_templates WHERE notes LIKE '%bulk-demo-seed%' OR name LIKE '%?%' OR meal_type LIKE '%?%'");
  await client.query("DELETE FROM favorite_products WHERE product_id IN (SELECT id FROM products WHERE name LIKE '%?%' OR category LIKE '%?%')");
  await client.query("DELETE FROM recipe_items WHERE product_id IN (SELECT id FROM products WHERE name LIKE '%?%' OR category LIKE '%?%')");
  await client.query("DELETE FROM products WHERE name LIKE '%?%' OR category LIKE '%?%'");
  await client.query("DELETE FROM meals WHERE notes LIKE '%bulk-demo-seed%' OR title LIKE '%?%' OR meal_type LIKE '%?%'");
  await client.query("DELETE FROM meal_plans WHERE title LIKE '%?%' OR meal_type LIKE '%?%'");
  await client.query("DELETE FROM shopping_items WHERE notes LIKE '%bulk-demo-seed%' OR title LIKE '%?%' OR category LIKE '%?%'");
  await client.query("DELETE FROM daily_notes WHERE notes LIKE '%bulk-demo-seed%' OR title LIKE '%?%'");
  await client.query("DELETE FROM body_metrics WHERE notes LIKE '%bulk-demo-seed%' OR notes LIKE '%?%'");
}

async function ensureProduct(client, product, adminId) {
  const [name, brand, category, calories, protein, fat, carbs] = product;
  const existing = await client.query("SELECT id FROM products WHERE lower(name) = lower($1) LIMIT 1", [name]);

  if (existing.rows[0]) {
    await client.query(
      "UPDATE products SET brand = $2, category = $3, calories = $4, protein = $5, fat = $6, carbs = $7, updated_at = NOW()::text WHERE id = $1",
      [existing.rows[0].id, brand, category, calories, protein, fat, carbs]
    );
    return existing.rows[0].id;
  }

  const inserted = await client.query(
    `INSERT INTO products (name, brand, category, calories, protein, fat, carbs, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()::text, NOW()::text)
     RETURNING id`,
    [name, brand, category, calories, protein, fat, carbs, adminId]
  );
  return inserted.rows[0].id;
}

async function seedUsers(client, users) {
  for (const [userIndex, user] of users.entries()) {
    await client.query(
      `INSERT INTO goals (user_id, calories, protein, fat, carbs, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW()::text)
       ON CONFLICT (user_id) DO UPDATE SET
         calories = EXCLUDED.calories,
         protein = EXCLUDED.protein,
         fat = EXCLUDED.fat,
         carbs = EXCLUDED.carbs,
         updated_at = EXCLUDED.updated_at`,
      [user.id, user.role === "admin" ? 2300 : 2150, user.role === "admin" ? 150 : 135, user.role === "admin" ? 75 : 68, user.role === "admin" ? 245 : 230]
    );

    await seedMeals(client, user.id, userIndex);
    await seedHydration(client, user.id, userIndex);
    await seedCheckins(client, user.id, userIndex);
    await seedMetrics(client, user.id, userIndex);
    await seedTemplates(client, user.id);
    await seedPlans(client, user.id, userIndex);
    await seedShopping(client, user.id);
    await seedNotes(client, user.id);
    await seedRecipes(client, user.id);
  }
}

async function seedMeals(client, userId, userIndex) {
  for (let offset = -44; offset <= 0; offset += 1) {
    const date = addDays(baseDate, offset);
    for (const [slot, seed] of mealSeeds.entries()) {
      const [mealType, eatenAt, title, grams, calories, protein, fat, carbs] = seed;
      const modifier = 0.92 + (((Math.abs(offset) + userIndex + slot) % 5) * 0.04);
      await client.query(
        `INSERT INTO meals (user_id, title, meal_type, entry_date, eaten_at, grams, calories, protein, fat, carbs, notes, created_at, updated_at)
         SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12
         WHERE NOT EXISTS (
           SELECT 1 FROM meals WHERE user_id = $1 AND entry_date = $4 AND meal_type = $3 AND eaten_at = $5
         )`,
        [
          userId,
          title,
          mealType,
          date,
          eatenAt,
          round(grams * modifier),
          round(calories * modifier),
          round(protein * modifier),
          round(fat * modifier),
          round(carbs * modifier),
          "Демонстрационная история питания. readable-demo-seed",
          `${date}T${eatenAt}:00.000Z`
        ]
      );
    }
  }
}

async function seedHydration(client, userId, userIndex) {
  const water = [["07:50", 350], ["11:20", 400], ["14:30", 300], ["17:45", 450], ["21:10", 300]];
  for (let offset = -44; offset <= 0; offset += 1) {
    const date = addDays(baseDate, offset);
    for (const [slot, [loggedAt, amount]] of water.entries()) {
      await client.query(
        `INSERT INTO hydration_logs (user_id, amount_ml, entry_date, logged_at, created_at)
         SELECT $1, $2, $3, $4, $5
         WHERE NOT EXISTS (
           SELECT 1 FROM hydration_logs WHERE user_id = $1 AND entry_date = $3 AND logged_at = $4
         )`,
        [userId, amount + (((Math.abs(offset) + userIndex + slot) % 3) * 50), date, loggedAt, `${date}T${loggedAt}:00.000Z`]
      );
    }
  }
}

async function seedCheckins(client, userId, userIndex) {
  for (let offset = -44; offset <= 0; offset += 1) {
    const date = addDays(baseDate, offset);
    const seed = Math.abs(offset) + userIndex;
    await client.query(
      `INSERT INTO daily_checkins (user_id, entry_date, mood, energy, stress, hunger, sleep_hours, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()::text)
       ON CONFLICT (user_id, entry_date) DO UPDATE SET
         mood = EXCLUDED.mood,
         energy = EXCLUDED.energy,
         stress = EXCLUDED.stress,
         hunger = EXCLUDED.hunger,
         sleep_hours = EXCLUDED.sleep_hours,
         notes = EXCLUDED.notes,
         updated_at = EXCLUDED.updated_at`,
      [userId, date, 3 + (seed % 3), 3 + ((seed + 1) % 3), 1 + (seed % 3), 2 + (seed % 3), round(6.5 + ((seed % 4) * 0.4)), "Ежедневный check-in для демонстрации аналитики.", `${date}T07:30:00.000Z`]
    );
  }
}

async function seedMetrics(client, userId, userIndex) {
  for (let week = 0; week < 12; week += 1) {
    const date = addDays(baseDate, -week * 7);
    await client.query(
      `INSERT INTO body_metrics (user_id, entry_date, weight_kg, body_fat, waist_cm, chest_cm, notes, created_at)
       SELECT $1, $2, $3, $4, $5, $6, $7, $8
       WHERE NOT EXISTS (
         SELECT 1 FROM body_metrics WHERE user_id = $1 AND entry_date = $2
       )`,
      [
        userId,
        date,
        round(82 + userIndex * 1.8 - (11 - week) * 0.18),
        round(18 + ((userIndex + week) % 5) * 0.35),
        round(84 + ((userIndex + week) % 4) * 0.5),
        round(101 + ((userIndex + week) % 3) * 0.6),
        "Еженедельный замер тела. readable-demo-seed",
        `${date}T07:20:00.000Z`
      ]
    );
  }
}

async function seedTemplates(client, userId) {
  for (const seed of templateSeeds) {
    const [name, mealType, grams, calories, protein, fat, carbs, notes, usageCount] = seed;
    await client.query(
      `INSERT INTO meal_templates (user_id, name, meal_type, grams, calories, protein, fat, carbs, notes, usage_count, created_at, updated_at)
       SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()::text, NOW()::text
       WHERE NOT EXISTS (SELECT 1 FROM meal_templates WHERE user_id = $1 AND name = $2)`,
      [userId, name, mealType, grams, calories, protein, fat, carbs, notes, usageCount]
    );
  }
}

async function seedPlans(client, userId, userIndex) {
  const plans = [
    ["Завтрак", "Овсянка с йогуртом", "08:00", 410, 24, 11, 60],
    ["Обед", "Курица с гречкой", "13:00", 620, 46, 17, 70],
    ["Перекус", "Кефир и фрукт", "16:30", 250, 12, 5, 38],
    ["Ужин", "Рыба с овощами", "20:00", 470, 34, 15, 42]
  ];
  for (let offset = 0; offset <= 13; offset += 1) {
    const date = addDays(baseDate, offset);
    for (const [slot, seed] of plans.entries()) {
      const [mealType, title, plannedTime, calories, protein, fat, carbs] = seed;
      await client.query(
        `INSERT INTO meal_plans (user_id, entry_date, meal_type, title, target_calories, target_protein, target_fat, target_carbs, planned_time, completed, linked_template_id, created_at, updated_at)
         SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL, NOW()::text, NOW()::text
         WHERE NOT EXISTS (
           SELECT 1 FROM meal_plans WHERE user_id = $1 AND entry_date = $2 AND meal_type = $3 AND planned_time = $9
         )`,
        [userId, date, mealType, title, round(calories * (0.94 + (((offset + userIndex + slot) % 5) * 0.03))), protein, fat, carbs, plannedTime, date === baseDate && slot < 2 ? 1 : 0]
      );
    }
  }
}

async function seedShopping(client, userId) {
  for (const [title, category, quantity, unit, notes, checked] of shoppingSeeds) {
    await client.query(
      `INSERT INTO shopping_items (user_id, title, category, quantity, unit, planned_for, source, notes, is_checked, created_at, updated_at)
       SELECT $1, $2, $3, $4, $5, $6, 'readable-demo-seed', $7, $8, NOW()::text, NOW()::text
       WHERE NOT EXISTS (
         SELECT 1 FROM shopping_items WHERE user_id = $1 AND title = $2 AND planned_for = $6
       )`,
      [userId, title, category, quantity, unit, baseDate, notes, checked ? 1 : 0]
    );
  }
}

async function seedNotes(client, userId) {
  for (let offset = -13; offset <= 0; offset += 1) {
    const date = addDays(baseDate, offset);
    await client.query(
      `INSERT INTO daily_notes (user_id, entry_date, title, focus, wins, improvements, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()::text)
       ON CONFLICT (user_id, entry_date) DO UPDATE SET
         title = EXCLUDED.title,
         focus = EXCLUDED.focus,
         wins = EXCLUDED.wins,
         improvements = EXCLUDED.improvements,
         notes = EXCLUDED.notes,
         updated_at = EXCLUDED.updated_at`,
      [
        userId,
        date,
        "Фокус дня: питание и восстановление",
        "Держать структуру приемов пищи, воду и план на вечер.",
        "Закрыт базовый рацион, есть понятные точки контроля.",
        "Следить за белком во второй половине дня и не забывать воду.",
        "Демонстрационная заметка дня для живой истории.",
        `${date}T08:00:00.000Z`
      ]
    );
  }
}

async function seedRecipes(client, userId) {
  const productRows = await client.query("SELECT id, name, calories, protein, fat, carbs FROM products");
  const productsByName = new Map(productRows.rows.map((product) => [product.name, product]));

  for (const recipe of recipeSeeds) {
    const ingredients = recipe.ingredients
      .map(([productName, grams]) => ({ product: productsByName.get(productName), grams }))
      .filter((item) => item.product);
    const totals = ingredients.reduce(
      (acc, item) => {
        const ratio = item.grams / 100;
        acc.grams += item.grams;
        acc.calories += item.product.calories * ratio;
        acc.protein += item.product.protein * ratio;
        acc.fat += item.product.fat * ratio;
        acc.carbs += item.product.carbs * ratio;
        return acc;
      },
      { grams: 0, calories: 0, protein: 0, fat: 0, carbs: 0 }
    );

    const existing = await client.query("SELECT id FROM recipes WHERE user_id = $1 AND title = $2", [userId, recipe.title]);
    const recipeId = existing.rows[0]
      ? existing.rows[0].id
      : (
          await client.query(
            `INSERT INTO recipes (user_id, title, meal_type, total_grams, calories, protein, fat, carbs, notes, instructions, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()::text, NOW()::text)
             RETURNING id`,
            [userId, recipe.title, recipe.mealType, round(totals.grams), round(totals.calories), round(totals.protein), round(totals.fat), round(totals.carbs), recipe.notes, recipe.instructions]
          )
        ).rows[0].id;

    await client.query("DELETE FROM recipe_items WHERE recipe_id = $1", [recipeId]);
    for (const item of ingredients) {
      const ratio = item.grams / 100;
      await client.query(
        `INSERT INTO recipe_items (recipe_id, product_id, product_name, grams, calories, protein, fat, carbs, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()::text)`,
        [recipeId, item.product.id, item.product.name, item.grams, round(item.product.calories * ratio), round(item.product.protein * ratio), round(item.product.fat * ratio), round(item.product.carbs * ratio)]
      );
    }
  }
}

async function seedFavorites(client) {
  await client.query(`
    INSERT INTO favorite_products (user_id, product_id, created_at)
    SELECT u.id, p.id, NOW()::text
    FROM users u
    JOIN LATERAL (
      SELECT id FROM products ORDER BY protein DESC, calories DESC LIMIT 5
    ) p ON true
    ON CONFLICT (user_id, product_id) DO NOTHING
  `);
  await client.query(`
    INSERT INTO favorite_templates (user_id, template_id, created_at)
    SELECT user_id, id, NOW()::text
    FROM (
      SELECT id, user_id, row_number() OVER (PARTITION BY user_id ORDER BY usage_count DESC, updated_at DESC) AS rn
      FROM meal_templates
    ) ranked
    WHERE rn <= 3
    ON CONFLICT (user_id, template_id) DO NOTHING
  `);
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await cleanupBrokenDemo(client);

    const usersResult = await client.query("SELECT id, role FROM users ORDER BY id");
    const users = usersResult.rows;
    const adminId = users.find((user) => user.role === "admin")?.id || users[0]?.id;

    if (!adminId) {
      throw new Error("No users found. Run migrations/bootstrap before seeding demo data.");
    }

    for (const product of products) {
      await ensureProduct(client, product, adminId);
    }

    await seedUsers(client, users);
    await seedFavorites(client);
    await client.query("COMMIT");

    const stats = await client.query(`
      SELECT table_name, row_count
      FROM (
        SELECT 'products' AS table_name, COUNT(*)::int AS row_count FROM products
        UNION ALL SELECT 'meals', COUNT(*)::int FROM meals
        UNION ALL SELECT 'hydration_logs', COUNT(*)::int FROM hydration_logs
        UNION ALL SELECT 'meal_templates', COUNT(*)::int FROM meal_templates
        UNION ALL SELECT 'daily_checkins', COUNT(*)::int FROM daily_checkins
        UNION ALL SELECT 'body_metrics', COUNT(*)::int FROM body_metrics
        UNION ALL SELECT 'meal_plans', COUNT(*)::int FROM meal_plans
        UNION ALL SELECT 'shopping_items', COUNT(*)::int FROM shopping_items
        UNION ALL SELECT 'daily_notes', COUNT(*)::int FROM daily_notes
        UNION ALL SELECT 'recipes', COUNT(*)::int FROM recipes
        UNION ALL SELECT 'recipe_items', COUNT(*)::int FROM recipe_items
      ) stats
      ORDER BY table_name
    `);

    console.log(JSON.stringify({ seeded: true, baseDate, stats: stats.rows }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
