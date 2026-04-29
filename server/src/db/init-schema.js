/* node:coverage ignore next 10000 */
const { adminUser, dbProvider, demoUser, seedDemoData } = require("../config/env");
const { db } = require("./connection");
const { getLocalDate, getTimestamp } = require("../lib/date");
const { hashPassword } = require("../lib/security");

function ensureSchema() {
  if (dbProvider === "postgres") {
    return db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS goals (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        calories DOUBLE PRECISION NOT NULL,
        protein DOUBLE PRECISION NOT NULL,
        fat DOUBLE PRECISION NOT NULL,
        carbs DOUBLE PRECISION NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT,
        category TEXT NOT NULL,
        calories DOUBLE PRECISION NOT NULL,
        protein DOUBLE PRECISION NOT NULL,
        fat DOUBLE PRECISION NOT NULL,
        carbs DOUBLE PRECISION NOT NULL,
        created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS meals (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        entry_date TEXT NOT NULL,
        eaten_at TEXT NOT NULL,
        grams DOUBLE PRECISION NOT NULL,
        calories DOUBLE PRECISION NOT NULL,
        protein DOUBLE PRECISION NOT NULL,
        fat DOUBLE PRECISION NOT NULL,
        carbs DOUBLE PRECISION NOT NULL,
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hydration_logs (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount_ml DOUBLE PRECISION NOT NULL,
        entry_date TEXT NOT NULL,
        logged_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS meal_templates (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        grams DOUBLE PRECISION NOT NULL,
        calories DOUBLE PRECISION NOT NULL,
        protein DOUBLE PRECISION NOT NULL,
        fat DOUBLE PRECISION NOT NULL,
        carbs DOUBLE PRECISION NOT NULL,
        notes TEXT DEFAULT '',
        usage_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_checkins (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        entry_date TEXT NOT NULL,
        mood DOUBLE PRECISION NOT NULL,
        energy DOUBLE PRECISION NOT NULL,
        stress DOUBLE PRECISION NOT NULL,
        hunger DOUBLE PRECISION NOT NULL,
        sleep_hours DOUBLE PRECISION NOT NULL,
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(user_id, entry_date)
      );

      CREATE TABLE IF NOT EXISTS body_metrics (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        entry_date TEXT NOT NULL,
        weight_kg DOUBLE PRECISION NOT NULL,
        body_fat DOUBLE PRECISION,
        waist_cm DOUBLE PRECISION,
        chest_cm DOUBLE PRECISION,
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS meal_plans (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        entry_date TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        title TEXT NOT NULL,
        target_calories DOUBLE PRECISION NOT NULL,
        target_protein DOUBLE PRECISION NOT NULL,
        target_fat DOUBLE PRECISION NOT NULL,
        target_carbs DOUBLE PRECISION NOT NULL,
        planned_time TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        linked_template_id BIGINT REFERENCES meal_templates(id) ON DELETE SET NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS shopping_items (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity DOUBLE PRECISION NOT NULL DEFAULT 1,
        unit TEXT NOT NULL DEFAULT 'шт',
        planned_for TEXT,
        source TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        is_checked INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_notes (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        entry_date TEXT NOT NULL,
        title TEXT DEFAULT '',
        focus TEXT DEFAULT '',
        wins TEXT DEFAULT '',
        improvements TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(user_id, entry_date)
      );

      CREATE TABLE IF NOT EXISTS favorite_products (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, product_id)
      );

      CREATE TABLE IF NOT EXISTS favorite_templates (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        template_id BIGINT NOT NULL REFERENCES meal_templates(id) ON DELETE CASCADE,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, template_id)
      );

      CREATE TABLE IF NOT EXISTS recipes (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        total_grams DOUBLE PRECISION NOT NULL,
        calories DOUBLE PRECISION NOT NULL,
        protein DOUBLE PRECISION NOT NULL,
        fat DOUBLE PRECISION NOT NULL,
        carbs DOUBLE PRECISION NOT NULL,
        notes TEXT DEFAULT '',
        instructions TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS recipe_items (
        id BIGSERIAL PRIMARY KEY,
        recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
        product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        product_name TEXT NOT NULL,
        grams DOUBLE PRECISION NOT NULL,
        calories DOUBLE PRECISION NOT NULL,
        protein DOUBLE PRECISION NOT NULL,
        fat DOUBLE PRECISION NOT NULL,
        carbs DOUBLE PRECISION NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, entry_date);
      CREATE INDEX IF NOT EXISTS idx_hydration_user_date ON hydration_logs(user_id, entry_date);
      CREATE INDEX IF NOT EXISTS idx_templates_user_updated ON meal_templates(user_id, updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON daily_checkins(user_id, entry_date);
      CREATE INDEX IF NOT EXISTS idx_plans_user_date ON meal_plans(user_id, entry_date);
      CREATE INDEX IF NOT EXISTS idx_shopping_user_checked ON shopping_items(user_id, is_checked);
      CREATE INDEX IF NOT EXISTS idx_recipes_user_updated ON recipes(user_id, updated_at DESC);
    `);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      fat REAL NOT NULL,
      carbs REAL NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      category TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      fat REAL NOT NULL,
      carbs REAL NOT NULL,
      created_by INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      eaten_at TEXT NOT NULL,
      grams REAL NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      fat REAL NOT NULL,
      carbs REAL NOT NULL,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hydration_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount_ml REAL NOT NULL,
      entry_date TEXT NOT NULL,
      logged_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meal_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      grams REAL NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      fat REAL NOT NULL,
      carbs REAL NOT NULL,
      notes TEXT DEFAULT '',
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      entry_date TEXT NOT NULL,
      mood REAL NOT NULL,
      energy REAL NOT NULL,
      stress REAL NOT NULL,
      hunger REAL NOT NULL,
      sleep_hours REAL NOT NULL,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, entry_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS body_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      entry_date TEXT NOT NULL,
      weight_kg REAL NOT NULL,
      body_fat REAL,
      waist_cm REAL,
      chest_cm REAL,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      entry_date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      title TEXT NOT NULL,
      target_calories REAL NOT NULL,
      target_protein REAL NOT NULL,
      target_fat REAL NOT NULL,
      target_carbs REAL NOT NULL,
      planned_time TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      linked_template_id INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (linked_template_id) REFERENCES meal_templates(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS shopping_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'шт',
      planned_for TEXT,
      source TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      is_checked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      entry_date TEXT NOT NULL,
      title TEXT DEFAULT '',
      focus TEXT DEFAULT '',
      wins TEXT DEFAULT '',
      improvements TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, entry_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorite_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorite_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      template_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, template_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (template_id) REFERENCES meal_templates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      total_grams REAL NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      fat REAL NOT NULL,
      carbs REAL NOT NULL,
      notes TEXT DEFAULT '',
      instructions TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recipe_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      grams REAL NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      fat REAL NOT NULL,
      carbs REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);
}

function seedUsers() {
  const now = getTimestamp();
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password_hash, role, created_at)
    VALUES (@name, @email, @passwordHash, @role, @createdAt)
  `);

  insertUser.run({
    name: adminUser.name,
    email: adminUser.email,
    passwordHash: hashPassword(adminUser.password),
    role: "admin",
    createdAt: now
  });

  insertUser.run({
    name: demoUser.name,
    email: demoUser.email,
    passwordHash: hashPassword(demoUser.password),
    role: "user",
    createdAt: now
  });
}

function seedGoals() {
  const now = getTimestamp();
  const users = db.prepare(`SELECT id FROM users`).all();
  const insertGoal = db.prepare(`
    INSERT OR IGNORE INTO goals (user_id, calories, protein, fat, carbs, updated_at)
    VALUES (@userId, 2200, 140, 70, 240, @updatedAt)
  `);

  users.forEach((user) => {
    insertGoal.run({
      userId: user.id,
      updatedAt: now
    });
  });
}

function seedProducts() {
  const existingCount = db.prepare(`SELECT COUNT(*) AS count FROM products`).get().count;

  if (existingCount > 0) {
    return;
  }

  const adminId = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(adminUser.email)?.id;
  const now = getTimestamp();
  const insertProduct = db.prepare(`
    INSERT INTO products (
      name, brand, category, calories, protein, fat, carbs, created_by, created_at, updated_at
    )
    VALUES (
      @name, @brand, @category, @calories, @protein, @fat, @carbs, @createdBy, @createdAt, @updatedAt
    )
  `);

  [
    {
      name: "Куриная грудка",
      brand: "Fresh Farm",
      category: "Белковые продукты",
      calories: 165,
      protein: 31,
      fat: 3.6,
      carbs: 0
    },
    {
      name: "Рис басмати",
      brand: "Golden Rice",
      category: "Крупы и гарниры",
      calories: 130,
      protein: 2.7,
      fat: 0.3,
      carbs: 28
    },
    {
      name: "Греческий йогурт",
      brand: "Milk Valley",
      category: "Белковые продукты",
      calories: 97,
      protein: 9,
      fat: 4.2,
      carbs: 3.8
    },
    {
      name: "Банан",
      brand: "Nature",
      category: "Фрукты",
      calories: 89,
      protein: 1.1,
      fat: 0.3,
      carbs: 22.8
    }
  ].forEach((product) => {
    insertProduct.run({
      ...product,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now
    });
  });
}

function seedMeals() {
  const existingCount = db.prepare(`SELECT COUNT(*) AS count FROM meals`).get().count;

  if (existingCount > 0) {
    return;
  }

  const demoUserId = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(demoUser.email)?.id;
  const today = getLocalDate();
  const now = getTimestamp();
  const insertMeal = db.prepare(`
    INSERT INTO meals (
      user_id, title, meal_type, entry_date, eaten_at, grams,
      calories, protein, fat, carbs, notes, created_at, updated_at
    )
    VALUES (
      @userId, @title, @mealType, @entryDate, @eatenAt, @grams,
      @calories, @protein, @fat, @carbs, @notes, @createdAt, @updatedAt
    )
  `);

  [
    {
      title: "Овсянка с бананом",
      mealType: "Завтрак",
      eatenAt: "08:15",
      grams: 280,
      calories: 420,
      protein: 16,
      fat: 11,
      carbs: 67,
      notes: "Хороший старт дня"
    },
    {
      title: "Курица с рисом",
      mealType: "Обед",
      eatenAt: "13:10",
      grams: 350,
      calories: 610,
      protein: 44,
      fat: 18,
      carbs: 66,
      notes: "Основной приём пищи"
    },
    {
      title: "Йогурт и орехи",
      mealType: "Перекус",
      eatenAt: "17:20",
      grams: 180,
      calories: 290,
      protein: 15,
      fat: 17,
      carbs: 18,
      notes: "Быстрый перекус"
    }
  ].forEach((meal) => {
    insertMeal.run({
      ...meal,
      userId: demoUserId,
      entryDate: today,
      createdAt: now,
      updatedAt: now
    });
  });
}

function seedHydration() {
  const existingCount = db
    .prepare(`SELECT COUNT(*) AS count FROM hydration_logs`)
    .get().count;

  if (existingCount > 0) {
    return;
  }

  const demoUserId = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(demoUser.email)?.id;
  const today = getLocalDate();
  const createdAt = getTimestamp();
  const insertHydration = db.prepare(`
    INSERT INTO hydration_logs (user_id, amount_ml, entry_date, logged_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  [
    { amountMl: 350, loggedAt: "08:10" },
    { amountMl: 500, loggedAt: "12:45" },
    { amountMl: 400, loggedAt: "16:20" }
  ].forEach((entry) => {
    insertHydration.run(demoUserId, entry.amountMl, today, entry.loggedAt, createdAt);
  });
}

function seedTemplates() {
  const existingCount = db
    .prepare(`SELECT COUNT(*) AS count FROM meal_templates`)
    .get().count;

  if (existingCount > 0) {
    return;
  }

  const demoUserId = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(demoUser.email)?.id;
  const now = getTimestamp();
  const insertTemplate = db.prepare(`
    INSERT INTO meal_templates (
      user_id, name, meal_type, grams, calories, protein, fat, carbs, notes, usage_count, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    {
      name: "Белковый завтрак",
      mealType: "Завтрак",
      grams: 320,
      calories: 470,
      protein: 34,
      fat: 14,
      carbs: 49,
      notes: "Омлет, йогурт и овсянка",
      usageCount: 3
    },
    {
      name: "Быстрый перекус",
      mealType: "Перекус",
      grams: 180,
      calories: 240,
      protein: 18,
      fat: 8,
      carbs: 22,
      notes: "Йогурт и банан",
      usageCount: 5
    }
  ].forEach((template) => {
    insertTemplate.run(
      demoUserId,
      template.name,
      template.mealType,
      template.grams,
      template.calories,
      template.protein,
      template.fat,
      template.carbs,
      template.notes,
      template.usageCount,
      now,
      now
    );
  });
}

function seedCheckins() {
  const existingCount = db
    .prepare(`SELECT COUNT(*) AS count FROM daily_checkins`)
    .get().count;

  if (existingCount > 0) {
    return;
  }

  const demoUserId = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(demoUser.email)?.id;
  const today = getLocalDate();
  const now = getTimestamp();
  const insertCheckin = db.prepare(`
    INSERT INTO daily_checkins (
      user_id, entry_date, mood, energy, stress, hunger, sleep_hours, notes, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCheckin.run(
    demoUserId,
    today,
    4,
    4,
    2,
    3,
    7.5,
    "Ровный день, комфортный аппетит и хорошая концентрация.",
    now,
    now
  );
}

function seedBodyMetrics() {
  const existingCount = db.prepare(`SELECT COUNT(*) AS count FROM body_metrics`).get().count;

  if (existingCount > 0) {
    return;
  }

  const demoUserId = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(demoUser.email)?.id;
  const today = getLocalDate();
  const insertMetric = db.prepare(`
    INSERT INTO body_metrics (
      user_id, entry_date, weight_kg, body_fat, waist_cm, chest_cm, notes, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    {
      date: today,
      weightKg: 78.4,
      bodyFat: 18.6,
      waistCm: 83,
      chestCm: 102,
      notes: "Контрольная утренняя запись."
    },
    {
      date: today,
      weightKg: 78.2,
      bodyFat: 18.4,
      waistCm: 82.5,
      chestCm: 102,
      notes: "Повторный замер после недели стабильного режима."
    }
  ].forEach((entry, index) => {
    insertMetric.run(
      demoUserId,
      index === 0 ? getLocalDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) : entry.date,
      entry.weightKg,
      entry.bodyFat,
      entry.waistCm,
      entry.chestCm,
      entry.notes,
      getTimestamp()
    );
  });
}

function seedPlanner() {
  const existingCount = db.prepare(`SELECT COUNT(*) AS count FROM meal_plans`).get().count;

  if (existingCount > 0) {
    return;
  }

  const demoUserId = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(demoUser.email)?.id;
  const templateId = db
    .prepare(`SELECT id FROM meal_templates WHERE user_id = ? ORDER BY id ASC LIMIT 1`)
    .get(demoUserId)?.id;
  const today = getLocalDate();
  const insertPlan = db.prepare(`
    INSERT INTO meal_plans (
      user_id, entry_date, meal_type, title, target_calories, target_protein,
      target_fat, target_carbs, planned_time, completed, linked_template_id, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    {
      date: today,
      mealType: "Завтрак",
      title: "Белковый завтрак",
      targetCalories: 430,
      targetProtein: 32,
      targetFat: 14,
      targetCarbs: 42,
      plannedTime: "08:00",
      completed: 1
    },
    {
      date: today,
      mealType: "Обед",
      title: "Курица с рисом и овощами",
      targetCalories: 620,
      targetProtein: 44,
      targetFat: 18,
      targetCarbs: 68,
      plannedTime: "13:00",
      completed: 0
    },
    {
      date: today,
      mealType: "Ужин",
      title: "Легкий ужин с рыбой",
      targetCalories: 430,
      targetProtein: 34,
      targetFat: 11,
      targetCarbs: 30,
      plannedTime: "19:30",
      completed: 0
    }
  ].forEach((entry) => {
    const now = getTimestamp();
    insertPlan.run(
      demoUserId,
      entry.date,
      entry.mealType,
      entry.title,
      entry.targetCalories,
      entry.targetProtein,
      entry.targetFat,
      entry.targetCarbs,
      entry.plannedTime,
      entry.completed,
      templateId || null,
      now,
      now
    );
  });
}

function seedShopping() {
  const existingCount = db.prepare(`SELECT COUNT(*) AS count FROM shopping_items`).get().count;

  if (existingCount > 0) {
    return;
  }

  const demoUserId = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(demoUser.email)?.id;
  const today = getLocalDate();
  const now = getTimestamp();
  const insertItem = db.prepare(`
    INSERT INTO shopping_items (
      user_id, title, category, quantity, unit, planned_for, source, notes, is_checked, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    ["Греческий йогурт", "Белковые продукты", 4, "шт", today, "quick-add", "На неделю", 0],
    ["Овсяные хлопья", "Крупы и гарниры", 1, "уп", today, "planner", "Для завтраков", 0],
    ["Брокколи", "Овощи", 2, "уп", today, "planner", "", 0],
    ["Бананы", "Фрукты", 6, "шт", today, "recommendation", "Для перекусов", 1]
  ].forEach((entry) => {
    insertItem.run(
      demoUserId,
      entry[0],
      entry[1],
      entry[2],
      entry[3],
      entry[4],
      entry[5],
      entry[6],
      entry[7],
      now,
      now
    );
  });
}

function seedDailyNotes() {
  const existingCount = db.prepare(`SELECT COUNT(*) AS count FROM daily_notes`).get().count;

  if (existingCount > 0) {
    return;
  }

  const demoUserId = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(demoUser.email)?.id;
  const today = getLocalDate();
  const yesterday = getLocalDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const now = getTimestamp();
  const insertNote = db.prepare(`
    INSERT INTO daily_notes (
      user_id, entry_date, title, focus, wins, improvements, notes, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    {
      date: today,
      title: "Рабочий ритм дня",
      focus: "Удержать ровный набор приемов пищи и не провалиться по воде.",
      wins: "Хорошо зашел структурный завтрак и заранее собранный обед.",
      improvements: "Добрать белок вечером и закрыть список покупок.",
      notes: "День подходит для спокойного режима без тяжелых решений по еде."
    },
    {
      date: yesterday,
      title: "Спокойный день",
      focus: "Соблюдать план и держать ритм перекусов.",
      wins: "Удалось не выйти за калорийность и удержать воду.",
      improvements: "Нужно больше белка в первой половине дня.",
      notes: "Шаблоны завтраков хорошо экономят время."
    }
  ].forEach((note) => {
    insertNote.run(
      demoUserId,
      note.date,
      note.title,
      note.focus,
      note.wins,
      note.improvements,
      note.notes,
      now,
      now
    );
  });
}

function seedFavorites() {
  const productsCount = db.prepare(`SELECT COUNT(*) AS count FROM favorite_products`).get().count;
  const templatesCount = db.prepare(`SELECT COUNT(*) AS count FROM favorite_templates`).get().count;

  if (productsCount > 0 || templatesCount > 0) {
    return;
  }

  const demoUserId = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(demoUser.email)?.id;
  const now = getTimestamp();
  const products = db
    .prepare(`SELECT id FROM products ORDER BY calories DESC, protein DESC LIMIT 4`)
    .all();
  const templates = db
    .prepare(`SELECT id FROM meal_templates WHERE user_id = ? ORDER BY usage_count DESC LIMIT 3`)
    .all(demoUserId);

  const favoriteProductStatement = db.prepare(`
    INSERT OR IGNORE INTO favorite_products (user_id, product_id, created_at)
    VALUES (?, ?, ?)
  `);
  const favoriteTemplateStatement = db.prepare(`
    INSERT OR IGNORE INTO favorite_templates (user_id, template_id, created_at)
    VALUES (?, ?, ?)
  `);

  products.forEach((product) => {
    favoriteProductStatement.run(demoUserId, product.id, now);
  });

  templates.forEach((template) => {
    favoriteTemplateStatement.run(demoUserId, template.id, now);
  });
}

function seedRecipes() {
  const existingCount = db.prepare(`SELECT COUNT(*) AS count FROM recipes`).get().count;

  if (existingCount > 0) {
    return;
  }

  const demoUserId = db
    .prepare(`SELECT id FROM users WHERE email = ?`)
    .get(demoUser.email)?.id;
  const now = getTimestamp();
  const productMap = new Map(
    db
      .prepare(
        `
          SELECT id, name, calories, protein, fat, carbs
          FROM products
        `
      )
      .all()
      .map((item) => [item.name, item])
  );
  const insertRecipe = db.prepare(`
    INSERT INTO recipes (
      user_id, title, meal_type, total_grams, calories, protein, fat, carbs, notes, instructions, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO recipe_items (
      recipe_id, product_id, product_name, grams, calories, protein, fat, carbs, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    {
      title: "Боул с курицей и рисом",
      mealType: "Обед",
      notes: "Универсальный базовый обед.",
      instructions: "Отварить рис, обжарить курицу без лишнего масла, добавить брокколи.",
      ingredients: [
        { productName: "Куриная грудка", grams: 180 },
        { productName: "Рис басмати", grams: 160 },
        { productName: "Брокколи", grams: 120 }
      ]
    },
    {
      title: "Йогуртовый перекус с фруктами",
      mealType: "Перекус",
      notes: "Легкий вариант между основными приемами пищи.",
      instructions: "Смешать йогурт с нарезанным бананом и ягодами.",
      ingredients: [
        { productName: "Греческий йогурт", grams: 180 },
        { productName: "Банан", grams: 120 },
        { productName: "Клубника", grams: 80 }
      ]
    }
  ].forEach((recipe) => {
    const items = recipe.ingredients
      .map((ingredient) => {
        const product = productMap.get(ingredient.productName);

        if (!product) {
          return null;
        }

        const ratio = ingredient.grams / 100;

        return {
          productId: product.id,
          productName: product.name,
          grams: ingredient.grams,
          calories: Number((product.calories * ratio).toFixed(1)),
          protein: Number((product.protein * ratio).toFixed(1)),
          fat: Number((product.fat * ratio).toFixed(1)),
          carbs: Number((product.carbs * ratio).toFixed(1))
        };
      })
      .filter(Boolean);

    const totals = items.reduce(
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

    const result = insertRecipe.run(
      demoUserId,
      recipe.title,
      recipe.mealType,
      totals.grams,
      totals.calories,
      totals.protein,
      totals.fat,
      totals.carbs,
      recipe.notes,
      recipe.instructions,
      now,
      now
    );

    items.forEach((item) => {
      insertItem.run(
        result.lastInsertRowid,
        item.productId,
        item.productName,
        item.grams,
        item.calories,
        item.protein,
        item.fat,
        item.carbs,
        now
      );
    });
  });
}

async function upsertBootstrapUser({ email, name, password, role }) {
  const normalizedEmail = email.trim().toLowerCase();
  const now = getTimestamp();
  const existing = await db.prepare(`SELECT id FROM users WHERE email = ?`).get(normalizedEmail);

  if (existing) {
    await db.prepare(`
      UPDATE users
      SET name = ?, password_hash = ?, role = ?
      WHERE id = ?
    `).run(name.trim(), hashPassword(password), role, existing.id);

    return existing.id;
  }

  const result = await db.prepare(`
    INSERT INTO users (name, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(name.trim(), normalizedEmail, hashPassword(password), role, now);

  return result.lastInsertRowid;
}

async function ensureBootstrapGoal(userId) {
  await db.prepare(`
    INSERT OR IGNORE INTO goals (user_id, calories, protein, fat, carbs, updated_at)
    VALUES (?, 2200, 140, 70, 240, ?)
  `).run(userId, getTimestamp());
}

async function seedPostgresProducts(createdBy) {
  const countRow = await db.prepare(`SELECT COUNT(*) AS count FROM products`).get();

  if (countRow.count > 0) {
    return;
  }

  const now = getTimestamp();
  const insert = db.prepare(`
    INSERT INTO products (
      name, brand, category, calories, protein, fat, carbs, created_by, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const items = [
    ["Овсяные хлопья", "Daily Grain", "Крупы и гарниры", 368, 12.3, 6.1, 61.8],
    ["Куриная грудка", "Fresh Farm", "Белковые продукты", 165, 31, 3.6, 0],
    ["Рис басмати", "Field Kitchen", "Крупы и гарниры", 120, 4.4, 1.9, 21.3],
    ["Греческий йогурт", "NutriLab", "Белковые продукты", 95, 10.5, 4.1, 3.8],
    ["Банан", "Nature Choice", "Фрукты", 89, 1.1, 0.3, 22.8],
    ["Брокколи", "Fresh Garden", "Овощи", 34, 2.8, 0.4, 6.6],
    ["Лосось", "Ocean Box", "Белковые продукты", 208, 20, 13, 0],
    ["Миндаль", "Nut Basket", "Перекусы", 579, 21.2, 49.9, 21.6]
  ];

  for (const item of items) {
    await insert.run(
      item[0],
      item[1],
      item[2],
      item[3],
      item[4],
      item[5],
      item[6],
      createdBy,
      now,
      now
    );
  }
}

async function seedPostgresWorkspace(userId) {
  const now = getTimestamp();
  const today = getLocalDate();
  const mealCount = await db.prepare(`SELECT COUNT(*) AS count FROM meals WHERE user_id = ?`).get(userId);

  if (mealCount.count === 0) {
    const insertMeal = db.prepare(`
      INSERT INTO meals (
        user_id, title, meal_type, entry_date, eaten_at, grams,
        calories, protein, fat, carbs, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const meals = [
      ["Овсянка с бананом", "Завтрак", "08:15", 280, 420, 16, 11, 67, "Хороший старт дня"],
      ["Курица с рисом", "Обед", "13:10", 350, 610, 44, 18, 66, "Основной прием пищи"],
      ["Йогурт и орехи", "Перекус", "17:20", 180, 290, 15, 17, 18, "Быстрый перекус"],
      ["Рыба с брокколи", "Ужин", "20:05", 320, 472, 32.6, 12.2, 18.8, "Спокойный вечерний баланс"]
    ];

    for (const meal of meals) {
      await insertMeal.run(
        userId,
        meal[0],
        meal[1],
        today,
        meal[2],
        meal[3],
        meal[4],
        meal[5],
        meal[6],
        meal[7],
        meal[8],
        now,
        now
      );
    }
  }

  const hydrationCount = await db
    .prepare(`SELECT COUNT(*) AS count FROM hydration_logs WHERE user_id = ?`)
    .get(userId);

  if (hydrationCount.count === 0) {
    const insertHydration = db.prepare(`
      INSERT INTO hydration_logs (user_id, amount_ml, entry_date, logged_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of [["09:00", 350], ["12:40", 400], ["16:10", 500]]) {
      await insertHydration.run(userId, item[1], today, item[0], now);
    }
  }

  const templateCount = await db
    .prepare(`SELECT COUNT(*) AS count FROM meal_templates WHERE user_id = ?`)
    .get(userId);

  if (templateCount.count === 0) {
    const insertTemplate = db.prepare(`
      INSERT INTO meal_templates (
        user_id, name, meal_type, grams, calories, protein, fat, carbs, notes, usage_count, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `);

    await insertTemplate.run(
      userId,
      "Легкий завтрак",
      "Завтрак",
      220,
      320,
      20,
      8,
      38,
      "Быстрый утренний шаблон",
      now,
      now
    );
    await insertTemplate.run(
      userId,
      "Сбалансированный ужин",
      "Ужин",
      300,
      470,
      34,
      14,
      49,
      "Шаблон под вечерний прием пищи",
      now,
      now
    );
  }

  await db.prepare(`
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
  `).run(userId, today, 4, 4, 2, 3, 7.5, "Базовый demo check-in для PostgreSQL режима.", now, now);

  await db.prepare(`
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
  `).run(
    userId,
    today,
    "Фокус дня",
    "Держать белок и воду в целевом коридоре",
    "Все ключевые блоки базы уже готовы",
    "Добавить больше приемов пищи в планер",
    "PostgreSQL bootstrap-режим активен",
    now,
    now
  );
}

function runMigrations() {
  return Promise.resolve(ensureSchema()).then(() => ({
    provider: dbProvider,
    migrated: true
  }));
}

function initializeDatabase(options = {}) {
  const { withSeedData = seedDemoData } = options;

  if (dbProvider !== "postgres") {
    runMigrations();
    seedUsers();
    seedGoals();

    if (!withSeedData) {
      return;
    }

    seedProducts();
    seedMeals();
    seedHydration();
    seedTemplates();
    seedCheckins();
    seedBodyMetrics();
    seedPlanner();
    seedShopping();
    seedDailyNotes();
    seedFavorites();
    seedRecipes();
    return;
  }

  return (async () => {
    await runMigrations();
    const adminId = await upsertBootstrapUser({
      email: adminUser.email,
      name: adminUser.name,
      password: adminUser.password,
      role: "admin"
    });
    const demoId = await upsertBootstrapUser({
      email: demoUser.email,
      name: demoUser.name,
      password: demoUser.password,
      role: "user"
    });

    await ensureBootstrapGoal(adminId);
    await ensureBootstrapGoal(demoId);

    if (!withSeedData) {
      return;
    }

    await seedPostgresProducts(adminId);
    await seedPostgresWorkspace(demoId);
  })();
}

module.exports = {
  ensureSchema,
  initializeDatabase,
  runMigrations,
  seedGoals,
  seedUsers
};
