
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const modulesRouter = require("./routes/modules");
const lecturesRouter = require("./routes/lectures");
const resourcesRouter = require("./routes/resources");
const recordingsRouter = require("./routes/recordings");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({
    name: "LectureLens API",
    message: "Backend is running",
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");

    res.json({
      message: "Database connected successfully",
      time: result.rows[0].time,
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/api/modules", modulesRouter);
app.use("/api/lectures", lecturesRouter);
app.use("/api/resources", resourcesRouter);
app.use("/api/recordings", recordingsRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({ message: "Internal server error" });
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS modules (
      id BIGSERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      name VARCHAR(150) NOT NULL,
      code VARCHAR(50) DEFAULT '',
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lectures (
      id BIGSERIAL PRIMARY KEY,
      module_id BIGINT NOT NULL REFERENCES modules(id)
        ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      topic VARCHAR(200) DEFAULT '',
      lecture_date TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id BIGSERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      lecture_id BIGINT REFERENCES lectures(id)
        ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS resources (
      id BIGSERIAL PRIMARY KEY,
      module_id BIGINT NOT NULL REFERENCES modules(id)
        ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      author VARCHAR(200) DEFAULT '',
      url TEXT DEFAULT '',
      resource_type VARCHAR(50) DEFAULT 'other',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS recordings (
      id BIGSERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      lecture_id BIGINT NOT NULL REFERENCES lectures(id)
        ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      stored_filename VARCHAR(255) NOT NULL UNIQUE,
      original_filename VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      file_size BIGINT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transcripts (
      id BIGSERIAL PRIMARY KEY,
      recording_id BIGINT NOT NULL UNIQUE
        REFERENCES recordings(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL,
      transcript TEXT NOT NULL DEFAULT '',
      segments JSONB NOT NULL DEFAULT '[]'::jsonb,
      language VARCHAR(20),
      language_probability REAL,
      duration_seconds REAL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);


  console.log("LectureLens database tables are ready.");
}

const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`LectureLens backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize LectureLens:", error);
    process.exit(1);
  });
