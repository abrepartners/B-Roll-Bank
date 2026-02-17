try {
  require("dotenv").config();
} catch (error) {
  // Ignore missing dotenv; environment variables can be supplied by shell.
}

const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  CAROUSEL_INPUT_SCHEMA,
  GRAPHICS_CREATION_SKILL,
  SAMPLE_INPUT,
  generateCarousel,
} = require("./carouselGenerator");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, "data", "carousels");

fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/", (req, res) => {
  res.json({
    name: "carousel-mvp-api",
    status: "ok",
    endpoints: [
      "GET /api/schema",
      "GET /api/graphics-skill",
      "GET /api/sample-input",
      "POST /api/carousel",
    ],
  });
});

app.get("/api/schema", (req, res) => {
  res.json(CAROUSEL_INPUT_SCHEMA);
});

app.get("/api/sample-input", (req, res) => {
  res.json(SAMPLE_INPUT);
});

app.get("/api/graphics-skill", (req, res) => {
  res.json(GRAPHICS_CREATION_SKILL);
});

app.post("/api/carousel", async (req, res) => {
  const { persist, ...input } = req.body || {};
  const forceMockFromQuery =
    String(req.query.mock || "").toLowerCase() === "1" ||
    String(req.query.mock || "").toLowerCase() === "true";
  const useMock =
    forceMockFromQuery ||
    process.env.MOCK_MODE === "true" ||
    !process.env.OPENAI_API_KEY;

  try {
    const generated = await generateCarousel(input, {
      allowMock: true,
      forceMock: useMock,
    });
    const generationMode =
      generated && typeof generated._generation_mode === "string"
        ? generated._generation_mode
        : useMock
          ? "mock_forced"
          : "live";
    const output = { ...generated };
    delete output._generation_mode;

    const mode = generationMode.startsWith("live") ? "live" : "mock";
    const shouldPersist =
      persist === true ||
      String(persist || "").toLowerCase() === "true" ||
      String(req.query.persist || "").toLowerCase() === "1" ||
      String(req.query.persist || "").toLowerCase() === "true";

    let savedPath = null;
    if (shouldPersist) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `carousel-${stamp}.json`;
      const filePath = path.join(DATA_DIR, fileName);
      const record = {
        created_at: new Date().toISOString(),
        mode,
        mode_detail: generationMode,
        input,
        output,
      };

      fs.writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
      savedPath = filePath;
    }

    res.json({
      mode,
      mode_detail: generationMode,
      input,
      output,
      saved_path: savedPath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isValidationError =
      message.includes("Missing required field") ||
      message.includes("must be a non-empty string") ||
      message.includes("must be a string when provided") ||
      message.includes("num_slides must be an integer") ||
      message.includes("Input must be an object");

    res.status(isValidationError ? 400 : 500).json({
      error: message,
    });
  }
});

app.get("/api/carousels", (req, res) => {
  try {
    const files = fs
      .readdirSync(DATA_DIR)
      .filter((name) => name.endsWith(".json"))
      .sort()
      .reverse();

    const items = files.map((name) => ({
      file: name,
      path: path.join(DATA_DIR, name),
    }));

    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ error: "Failed to list saved carousels." });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Carousel API listening on http://localhost:${PORT}`);
  });
}

module.exports = { app };
