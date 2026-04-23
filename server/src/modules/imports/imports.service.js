const { getLocalDate } = require("../../lib/date");
const { createHttpError } = require("../../lib/http");
const {
  assertDate,
  assertMealType,
  assertNonEmptyString,
  assertNumber,
  assertOneOf,
  assertProductCategory,
  assertTime
} = require("../../lib/validation");
const { addHydrationEntry } = require("../hydration/hydration.service");
const { createMeal } = require("../meals/meals.service");
const { createProduct } = require("../products/products.service");
const { createTemplate } = require("../templates/templates.service");

const supportedFormats = ["json", "csv", "tsv"];
const supportedDatasets = ["meals", "templates", "hydration", "products"];

const datasetConfigs = {
  meals: {
    label: "Приемы пищи",
    sampleRows: [
      {
        title: "Овсянка с ягодами",
        mealType: "Завтрак",
        date: "2026-04-23",
        eatenAt: "08:15",
        grams: 260,
        calories: 390,
        protein: 15,
        fat: 10,
        carbs: 58,
        notes: "Импорт из шаблонного файла"
      },
      {
        title: "Курица с рисом",
        mealType: "Обед",
        date: "2026-04-23",
        eatenAt: "13:10",
        grams: 340,
        calories: 610,
        protein: 43,
        fat: 17,
        carbs: 67,
        notes: "Обеденный слот"
      }
    ],
    normalize(row, rowNumber) {
      return {
        rowNumber,
        data: {
          title: readRequiredString(row, ["title", "name"], "title"),
          mealType: readRequiredString(row, ["mealType", "meal_type", "type"], "mealType"),
          date: readOptionalString(row, ["date", "entryDate", "entry_date"]) || getLocalDate(),
          eatenAt: readRequiredString(row, ["eatenAt", "eaten_at", "time"], "eatenAt"),
          grams: readRequiredNumber(row, ["grams", "weight", "portion"], "grams"),
          calories: readRequiredNumber(row, ["calories", "kcal", "energy"], "calories"),
          protein: readRequiredNumber(row, ["protein", "proteins"], "protein"),
          fat: readRequiredNumber(row, ["fat", "fats"], "fat"),
          carbs: readRequiredNumber(row, ["carbs", "carbohydrates"], "carbs"),
          notes: readOptionalString(row, ["notes", "note", "comment"]) || ""
        }
      };
    },
    validate(payload) {
      assertNonEmptyString(payload.title, "title");
      assertMealType(payload.mealType);
      assertDate(payload.date);
      assertTime(payload.eatenAt);
      assertNumber(payload.grams, "grams");
      assertNumber(payload.calories, "calories");
      assertNumber(payload.protein, "protein");
      assertNumber(payload.fat, "fat");
      assertNumber(payload.carbs, "carbs");
      if (payload.notes) {
        assertNonEmptyString(payload.notes, "notes");
      }
    },
    apply(user, payload) {
      return createMeal(user.id, payload);
    }
  },
  templates: {
    label: "Шаблоны",
    sampleRows: [
      {
        name: "Легкий завтрак",
        mealType: "Завтрак",
        grams: 220,
        calories: 320,
        protein: 20,
        fat: 8,
        carbs: 38,
        notes: "Быстрый шаблон для утра"
      },
      {
        name: "Балансированный ужин",
        mealType: "Ужин",
        grams: 300,
        calories: 470,
        protein: 34,
        fat: 14,
        carbs: 49,
        notes: "Шаблон под вечерний прием пищи"
      }
    ],
    normalize(row, rowNumber) {
      return {
        rowNumber,
        data: {
          name: readRequiredString(row, ["name", "title"], "name"),
          mealType: readRequiredString(row, ["mealType", "meal_type", "type"], "mealType"),
          grams: readRequiredNumber(row, ["grams", "weight", "portion"], "grams"),
          calories: readRequiredNumber(row, ["calories", "kcal", "energy"], "calories"),
          protein: readRequiredNumber(row, ["protein", "proteins"], "protein"),
          fat: readRequiredNumber(row, ["fat", "fats"], "fat"),
          carbs: readRequiredNumber(row, ["carbs", "carbohydrates"], "carbs"),
          notes: readOptionalString(row, ["notes", "note", "comment"]) || ""
        }
      };
    },
    validate(payload) {
      assertNonEmptyString(payload.name, "name");
      assertMealType(payload.mealType);
      assertNumber(payload.grams, "grams");
      assertNumber(payload.calories, "calories");
      assertNumber(payload.protein, "protein");
      assertNumber(payload.fat, "fat");
      assertNumber(payload.carbs, "carbs");
      if (payload.notes) {
        assertNonEmptyString(payload.notes, "notes");
      }
    },
    apply(user, payload) {
      return createTemplate(user.id, payload);
    }
  },
  hydration: {
    label: "Вода",
    sampleRows: [
      {
        date: "2026-04-23",
        loggedAt: "09:00",
        amountMl: 350
      },
      {
        date: "2026-04-23",
        loggedAt: "14:30",
        amountMl: 500
      }
    ],
    normalize(row, rowNumber) {
      return {
        rowNumber,
        data: {
          date: readOptionalString(row, ["date", "entryDate", "entry_date"]) || getLocalDate(),
          loggedAt: readRequiredString(row, ["loggedAt", "logged_at", "time"], "loggedAt"),
          amountMl: readRequiredNumber(row, ["amountMl", "amount_ml", "ml", "amount"], "amountMl")
        }
      };
    },
    validate(payload) {
      assertDate(payload.date);
      assertTime(payload.loggedAt, "loggedAt");
      assertNumber(payload.amountMl, "amountMl");
    },
    apply(user, payload) {
      return addHydrationEntry(user.id, payload.amountMl, payload.loggedAt, payload.date);
    }
  },
  products: {
    label: "Продукты",
    adminOnly: true,
    sampleRows: [
      {
        name: "Греческий йогурт",
        brand: "NutriLab",
        category: "Белковые продукты",
        calories: 95,
        protein: 10.5,
        fat: 4.1,
        carbs: 3.8
      },
      {
        name: "Киноа",
        brand: "Field Kitchen",
        category: "Крупы и гарниры",
        calories: 120,
        protein: 4.4,
        fat: 1.9,
        carbs: 21.3
      }
    ],
    normalize(row, rowNumber) {
      return {
        rowNumber,
        data: {
          name: readRequiredString(row, ["name", "title"], "name"),
          brand: readOptionalString(row, ["brand", "vendor", "producer"]) || "",
          category: readRequiredString(row, ["category", "group"], "category"),
          calories: readRequiredNumber(row, ["calories", "kcal", "energy"], "calories"),
          protein: readRequiredNumber(row, ["protein", "proteins"], "protein"),
          fat: readRequiredNumber(row, ["fat", "fats"], "fat"),
          carbs: readRequiredNumber(row, ["carbs", "carbohydrates"], "carbs")
        }
      };
    },
    validate(payload) {
      assertNonEmptyString(payload.name, "name");
      assertProductCategory(payload.category);
      assertNumber(payload.calories, "calories");
      assertNumber(payload.protein, "protein");
      assertNumber(payload.fat, "fat");
      assertNumber(payload.carbs, "carbs");
      if (payload.brand) {
        assertNonEmptyString(payload.brand, "brand");
      }
    },
    apply(user, payload) {
      return createProduct(payload, user.id);
    }
  }
};

function normalizeDataset(dataset) {
  assertOneOf(dataset, "dataset", supportedDatasets);
  return dataset.trim();
}

function normalizeFormat(format) {
  assertOneOf(format, "format", supportedFormats);
  return format.trim();
}

function stripBom(value) {
  return String(value || "").replace(/^\uFEFF/, "");
}

function normalizeHeaderName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function buildRowReader(row) {
  const normalized = Object.fromEntries(
    Object.entries(row || {}).map(([key, value]) => [normalizeHeaderName(key), value])
  );

  return (aliases) => {
    for (const alias of aliases) {
      const value = normalized[normalizeHeaderName(alias)];

      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }

    return undefined;
  };
}

function readRequiredString(row, aliases, fieldName) {
  const value = buildRowReader(row)(aliases);
  assertNonEmptyString(String(value ?? ""), fieldName);
  return String(value).trim();
}

function readOptionalString(row, aliases) {
  const value = buildRowReader(row)(aliases);
  return value === undefined || value === null ? "" : String(value).trim();
}

function toImportNumber(value, fieldName) {
  if (typeof value === "number") {
    return value;
  }

  if (value === undefined || value === null || String(value).trim() === "") {
    throw createHttpError(400, `Field "${fieldName}" must be a non-negative number`);
  }

  const parsed = Number(String(value).trim().replace(/\s+/g, "").replace(",", "."));

  if (Number.isNaN(parsed)) {
    throw createHttpError(400, `Field "${fieldName}" must be a non-negative number`);
  }

  return parsed;
}

function readRequiredNumber(row, aliases, fieldName) {
  return toImportNumber(buildRowReader(row)(aliases), fieldName);
}

function parseSeparatedValues(content, delimiter) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const symbol = content[index];

    if (inQuotes) {
      if (symbol === '"') {
        if (content[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += symbol;
      }
      continue;
    }

    if (symbol === '"') {
      inQuotes = true;
      continue;
    }

    if (symbol === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (symbol === "\n") {
      row.push(cell);
      if (row.some((item) => String(item).trim() !== "")) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    if (symbol !== "\r") {
      cell += symbol;
    }
  }

  row.push(cell);
  if (row.some((item) => String(item).trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function parseDelimitedRecords(content, delimiter) {
  const rows = parseSeparatedValues(stripBom(content), delimiter);

  if (rows.length < 2) {
    throw createHttpError(400, "Import file must contain header row and at least one data row");
  }

  const headers = rows[0].map((header) => String(header || "").trim());

  if (!headers.some(Boolean)) {
    throw createHttpError(400, "Import header row is empty");
  }

  const records = rows.slice(1).map((row, index) => {
    const values = [...row];

    while (values.length < headers.length) {
      values.push("");
    }

    const record = {};
    headers.forEach((header, cellIndex) => {
      record[header] = values[cellIndex] ?? "";
    });

    return {
      rowNumber: index + 2,
      record
    };
  });

  return {
    columns: headers,
    rows: records
  };
}

function parseJsonRecords(dataset, content) {
  let parsed;

  try {
    parsed = JSON.parse(stripBom(content));
  } catch {
    throw createHttpError(400, "JSON import could not be parsed");
  }

  const records = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.items)
      ? parsed.items
      : Array.isArray(parsed?.[dataset])
        ? parsed[dataset]
        : null;

  if (!records) {
    throw createHttpError(400, "JSON import must contain an array or object with items");
  }

  const columns = [...new Set(records.flatMap((item) => Object.keys(item || {})))];

  return {
    columns,
    rows: records.map((record, index) => ({
      rowNumber: index + 1,
      record
    }))
  };
}

function getParsedRows(dataset, format, content) {
  const normalizedFormat = normalizeFormat(format);
  const rawContent = stripBom(content);

  if (!rawContent.trim()) {
    throw createHttpError(400, "Import content is empty");
  }

  if (normalizedFormat === "json") {
    return parseJsonRecords(dataset, rawContent);
  }

  return parseDelimitedRecords(rawContent, normalizedFormat === "tsv" ? "\t" : ",");
}

function ensureDatasetPermissions(user, dataset) {
  const config = datasetConfigs[dataset];

  if (config.adminOnly && user.role !== "admin") {
    throw createHttpError(403, "Only admin can import this dataset");
  }
}

function previewImport(user, payload) {
  const dataset = normalizeDataset(payload.dataset);
  const format = normalizeFormat(payload.format);
  ensureDatasetPermissions(user, dataset);

  const config = datasetConfigs[dataset];
  const parsed = getParsedRows(dataset, format, payload.content);
  const previewItems = [];
  const issues = [];
  const validRows = [];

  parsed.rows.forEach(({ rowNumber, record }) => {
    try {
      const normalized = config.normalize(record, rowNumber);
      config.validate(normalized.data);
      validRows.push(normalized.data);

      if (previewItems.length < 6) {
        previewItems.push({
          rowNumber,
          ...normalized.data
        });
      }
    } catch (error) {
      issues.push({
        rowNumber,
        message: error.message
      });
    }
  });

  return {
    dataset,
    datasetLabel: config.label,
    format,
    columns: parsed.columns,
    summary: {
      totalRows: parsed.rows.length,
      acceptedRows: validRows.length,
      invalidRows: issues.length
    },
    previewItems,
    issues,
    validRows
  };
}

function applyImport(user, payload) {
  const preview = previewImport(user, payload);

  if (!preview.validRows.length) {
    throw createHttpError(400, "Import contains no valid rows");
  }

  const config = datasetConfigs[preview.dataset];
  const importedItems = preview.validRows.map((row) => config.apply(user, row));

  return {
    dataset: preview.dataset,
    datasetLabel: preview.datasetLabel,
    format: preview.format,
    imported: importedItems.length,
    skipped: preview.issues.length,
    issues: preview.issues,
    importedItems: importedItems.slice(0, 6)
  };
}

function serializeDelimited(rows, delimiter) {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(delimiter)
    )
    .join("\n");
}

function buildTemplateFile(dataset, format) {
  const normalizedDataset = normalizeDataset(dataset);
  const normalizedFormat = normalizeFormat(format);
  const config = datasetConfigs[normalizedDataset];
  const sampleRows = config.sampleRows;
  const filenameBase = `ration-import-template-${normalizedDataset}`;

  if (normalizedFormat === "json") {
    return {
      filename: `${filenameBase}.json`,
      contentType: "application/json; charset=utf-8",
      content: `${JSON.stringify({ dataset: normalizedDataset, items: sampleRows }, null, 2)}\n`
    };
  }

  const headers = [...new Set(sampleRows.flatMap((row) => Object.keys(row)))];
  const table = [
    headers,
    ...sampleRows.map((row) => headers.map((header) => row[header] ?? ""))
  ];
  const delimiter = normalizedFormat === "tsv" ? "\t" : ",";
  const extension = normalizedFormat === "tsv" ? "tsv" : "csv";
  const contentType =
    normalizedFormat === "tsv"
      ? "text/tab-separated-values; charset=utf-8"
      : "text/csv; charset=utf-8";

  return {
    filename: `${filenameBase}.${extension}`,
    contentType,
    content: `\uFEFF${serializeDelimited(table, delimiter)}`
  };
}

module.exports = {
  applyImport,
  buildTemplateFile,
  previewImport,
  supportedDatasets,
  supportedFormats
};
