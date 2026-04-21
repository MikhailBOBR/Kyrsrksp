const { adminUser, demoUser } = require("../config/env");
const { db } = require("./connection");
const { getLocalDate, getTimestamp } = require("../lib/date");
const { hashPassword } = require("../lib/security");

function ensureSchema() {
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

function initializeDatabase() {
  ensureSchema();
  seedUsers();
  seedGoals();
  seedProducts();
  seedMeals();
  seedHydration();
  seedTemplates();
  seedCheckins();
  seedBodyMetrics();
  seedPlanner();
  seedShopping();
}

module.exports = {
  initializeDatabase
};
