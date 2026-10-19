
const express = require("express");
const pool = require("../config/database");

const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
router.use(requireAuth);


router.get("/", async (req, res) => {
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, code, description, created_at
       FROM modules
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("List modules error:", error);
    res.status(500).json({ message: "Could not load modules" });
  }
});

router.post("/", async (req, res) => {
  const userId = req.auth.userId;
  const { name, code = "", description = "" } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Module name is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO modules (user_id, name, code, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, code, description, created_at`,
      [userId, name.trim(), code.trim(), description.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create module error:", error);
    res.status(500).json({ message: "Could not create module" });
  }
});

router.put("/:id", async (req, res) => {
  const userId = req.auth.userId;
  const { name, code = "", description = "" } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Module name is required" });
  }

  try {
    const result = await pool.query(
      `UPDATE modules
       SET name = $1, code = $2, description = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, name, code, description, created_at`,
      [name.trim(), code.trim(), description.trim(), req.params.id, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update module error:", error);
    res.status(500).json({ message: "Could not update module" });
  }
});

router.delete("/:id", async (req, res) => {
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM modules
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Module not found" });
    }

    res.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Delete module error:", error);
    res.status(500).json({ message: "Could not delete module" });
  }
});

module.exports = router;
