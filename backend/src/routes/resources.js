
const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// DEMO ONLY: replace with verified Clerk authentication.
function getUserId(req) {
  return req.get("x-user-id");
}

// List resources for a module owned by the current demo user.
router.get("/module/:moduleId", async (req, res) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  try {
    const result = await pool.query(
      `SELECT r.id, r.module_id, r.title, r.author,
              r.url, r.resource_type, r.created_at
       FROM resources r
       JOIN modules m ON m.id = r.module_id
       WHERE r.module_id = $1 AND m.user_id = $2
       ORDER BY r.created_at DESC`,
      [req.params.moduleId, userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("List resources error:", error);
    res.status(500).json({ message: "Could not load resources" });
  }
});

// Save a resource against a module owned by the current demo user.
router.post("/module/:moduleId", async (req, res) => {
  const userId = getUserId(req);
  const {
    title,
    author = "",
    url = "",
    resource_type = "other",
  } = req.body;

  const allowedTypes = [
    "book",
    "article",
    "website",
    "paper",
    "video",
    "other",
  ];

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Resource title is required" });
  }

  if (!allowedTypes.includes(resource_type)) {
    return res.status(400).json({ message: "Invalid resource type" });
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
      `INSERT INTO resources
         (module_id, title, author, url, resource_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, module_id, title, author, url,
                 resource_type, created_at`,
      [
        req.params.moduleId,
        title.trim(),
        author.trim(),
        url.trim(),
        resource_type,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create resource error:", error);
    res.status(500).json({ message: "Could not save resource" });
  }
});

// Delete a resource, checking that it belongs to the user's module.
router.delete("/:resourceId", async (req, res) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ message: "User ID is required" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM resources r
       USING modules m
       WHERE r.module_id = m.id
         AND r.id = $1
         AND m.user_id = $2
       RETURNING r.id`,
      [req.params.resourceId, userId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({ message: "Could not delete resource" });
  }
});

module.exports = router;
