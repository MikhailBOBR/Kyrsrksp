const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const host = "0.0.0.0";
const port = Number(process.env.SERVER_PORT || 8080);
const clientRoot = path.resolve(__dirname, "../../client");

let goals = {
  calories: 2200,
  protein: 140,
  fat: 70,
  carbs: 240
};

let meals = [
  {
    id: "meal-1",
    title: "Овсянка с бананом",
    mealType: "Завтрак",
    eatenAt: "08:15",
    grams: 280,
    calories: 420,
    protein: 16,
    fat: 11,
    carbs: 67
  },
  {
    id: "meal-2",
    title: "Курица с рисом",
    mealType: "Обед",
    eatenAt: "13:10",
    grams: 350,
    calories: 610,
    protein: 44,
    fat: 18,
    carbs: 66
  },
  {
    id: "meal-3",
    title: "Йогурт и орехи",
    mealType: "Перекус",
    eatenAt: "17:20",
    grams: 180,
    calories: 290,
    protein: 15,
    fat: 17,
    carbs: 18
  }
];

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  response.end(payload);
}

async function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", reject);
  });
}

function validateNumber(value, fieldName) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new Error(`Field "${fieldName}" must be a non-negative number`);
  }
}

function calculateSummary() {
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
    goals,
    totals,
    remaining,
    progress
  };
}

async function handleApi(request, response, pathname) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    response.end();
    return true;
  }

  if (request.method === "GET" && pathname === "/api/health") {
    sendJson(response, 200, { status: "ok", service: "food-diary-app" });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/goals") {
    sendJson(response, 200, goals);
    return true;
  }

  if (request.method === "PUT" && pathname === "/api/goals") {
    try {
      const payload = await readBody(request);
      validateNumber(payload.calories, "calories");
      validateNumber(payload.protein, "protein");
      validateNumber(payload.fat, "fat");
      validateNumber(payload.carbs, "carbs");

      goals = {
        calories: payload.calories,
        protein: payload.protein,
        fat: payload.fat,
        carbs: payload.carbs
      };

      sendJson(response, 200, goals);
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }

    return true;
  }

  if (request.method === "GET" && pathname === "/api/meals") {
    const sortedMeals = [...meals].sort((left, right) =>
      left.eatenAt.localeCompare(right.eatenAt)
    );
    sendJson(response, 200, { items: sortedMeals });
    return true;
  }

  if (request.method === "POST" && pathname === "/api/meals") {
    try {
      const payload = await readBody(request);
      const requiredStringFields = ["title", "mealType", "eatenAt"];

      requiredStringFields.forEach((fieldName) => {
        if (
          typeof payload[fieldName] !== "string" ||
          payload[fieldName].trim().length === 0
        ) {
          throw new Error(`Field "${fieldName}" must be a non-empty string`);
        }
      });

      ["grams", "calories", "protein", "fat", "carbs"].forEach((fieldName) => {
        validateNumber(payload[fieldName], fieldName);
      });

      const meal = {
        id: `meal-${Date.now()}`,
        title: payload.title.trim(),
        mealType: payload.mealType.trim(),
        eatenAt: payload.eatenAt.trim(),
        grams: payload.grams,
        calories: payload.calories,
        protein: payload.protein,
        fat: payload.fat,
        carbs: payload.carbs
      };

      meals.push(meal);
      sendJson(response, 201, meal);
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }

    return true;
  }

  if (request.method === "DELETE" && pathname.startsWith("/api/meals/")) {
    const id = pathname.replace("/api/meals/", "");
    const previousLength = meals.length;
    meals = meals.filter((meal) => meal.id !== id);

    if (meals.length === previousLength) {
      sendJson(response, 404, { error: "Meal not found" });
      return true;
    }

    sendJson(response, 200, { success: true });
    return true;
  }

  if (request.method === "GET" && pathname === "/api/summary") {
    sendJson(response, 200, calculateSummary());
    return true;
  }

  return false;
}

async function serveStatic(response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = path
    .normalize(requestedPath)
    .replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(clientRoot, safePath);

  if (!filePath.startsWith(clientRoot)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const extension = path.extname(filePath);

    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream"
    });
    response.end(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(response, 404, "Not found");
      return;
    }

    sendText(response, 500, "Internal server error");
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const handled = await handleApi(request, response, url.pathname);

  if (handled) {
    return;
  }

  await serveStatic(response, url.pathname);
});

server.listen(port, host, () => {
  console.log(`Food diary app is running on http://localhost:${port}`);
});
