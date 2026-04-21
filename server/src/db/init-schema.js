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

function initializeDatabase() {
  ensureSchema();
  seedUsers();
  seedGoals();
  seedProducts();
  seedMeals();
}

module.exports = {
  initializeDatabase
};
