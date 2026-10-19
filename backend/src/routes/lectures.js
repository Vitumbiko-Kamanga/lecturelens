
const express = require("express");
const pool = require("../config/database");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// List lectures belonging to a module owned by the user.
router.get("/module/:moduleId", async (req, res) => {
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  try {
    const result = await pool.query(
      `SELECT l.id, l.module_id, l.title, l.topic,
              l.lecture_date, l.created_at
       FROM lectures l
       JOIN modules m ON m.id = l.module_id
       WHERE l.module_id = $1 AND m.user_id = $2
       ORDER BY l.lecture_date DESC NULLS LAST, l.id DESC`,
      [req.params.moduleId, userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("List lectures error:", error);
    res.status(500).json({ message: "Could not load lectures" });
  }
});

// Create a lecture inside a module owned by the user.
router.post("/module/:moduleId", async (req, res) => {
  const userId = req.auth.userId;
  const { title, topic = "", lecture_date } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Lecture title is required" });
  }

  try {
    const moduleResult = await pool.query(
      "SELECT id FROM modules WHERE id = $1 AND user_id = $2",
      [req.params.moduleId, userId]
    );

    if (!moduleResult.rowCount) {
      return res.status(404).json({ message: "Module not found" });
    }

    const result = await pool.query(
      `INSERT INTO lectures (module_id, title, topic, lecture_date)
       VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW()))
       RETURNING id, module_id, title, topic, lecture_date, created_at`,
      [
        req.params.moduleId,
        title.trim(),
        topic.trim(),
        lecture_date || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create lecture error:", error);
    res.status(500).json({ message: "Could not create lecture" });
  }
});


router.get("/:lectureId", async (req, res) => {
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  try {
    const result = await pool.query(
      `SELECT l.id, l.module_id, l.title, l.topic,
              l.lecture_date, l.created_at
       FROM lectures l
       JOIN modules m ON m.id = l.module_id
       WHERE l.id = $1 AND m.user_id = $2`,
      [req.params.lectureId, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get lecture error:", error);
    res.status(500).json({ message: "Could not load lecture" });
  }
});

// Delete a lecture owned by the user.
router.delete("/:lectureId", async (req, res) => {
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM lectures l
       USING modules m
       WHERE l.module_id = m.id
         AND l.id = $1
         AND m.user_id = $2
       RETURNING l.id`,
      [req.params.lectureId, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("Delete lecture error:", error);
    res.status(500).json({ message: "Could not delete lecture" });
  }
});

// List annotations saved for a lecture.
router.get("/:lectureId/notes", async (req, res) => {
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  try {
    const lectureResult = await pool.query(
      `SELECT l.id
       FROM lectures l
       JOIN modules m ON m.id = l.module_id
       WHERE l.id = $1 AND m.user_id = $2`,
      [req.params.lectureId, userId]
    );

    if (!lectureResult.rowCount) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const result = await pool.query(
      `SELECT id, lecture_id, title, content, created_at, updated_at
       FROM notes
       WHERE lecture_id = $1 AND user_id = $2
       ORDER BY created_at DESC`,
      [req.params.lectureId, userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("List annotations error:", error);
    res.status(500).json({ message: "Could not load annotations" });
  }
});

// Save an annotation for a lecture.
router.post("/:lectureId/notes", async (req, res) => {
  const userId = req.auth.userId;
  const { title, content = "" } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Annotation title is required" });
  }

  try {
    const lectureResult = await pool.query(
      `SELECT l.id
       FROM lectures l
       JOIN modules m ON m.id = l.module_id
       WHERE l.id = $1 AND m.user_id = $2`,
      [req.params.lectureId, userId]
    );

    if (!lectureResult.rowCount) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const result = await pool.query(
      `INSERT INTO notes (user_id, lecture_id, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, lecture_id, title, content, created_at, updated_at`,
      [userId, req.params.lectureId, title.trim(), content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create annotation error:", error);
    res.status(500).json({ message: "Could not save annotation" });
  }
});


router.delete("/notes/:noteId", async (req, res) => {
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM notes n
       USING lectures l, modules m
       WHERE n.lecture_id = l.id
         AND l.module_id = m.id
         AND n.id = $1
         AND n.user_id = $2
         AND m.user_id = $2
       RETURNING n.id`,
      [req.params.noteId, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    res.json({ message: "Annotation deleted successfully" });
  } catch (error) {
    console.error("Delete annotation error:", error);
    res.status(500).json({ message: "Could not delete annotation" });
  }
});

module.exports = router;
