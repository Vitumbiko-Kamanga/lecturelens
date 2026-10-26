
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const pool = require("../config/database");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const UPLOAD_DIR = path.join(
  __dirname,
  "../../uploads/recordings"
);

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const allowedExtensions = new Set([
  ".m4a",
  ".mp3",
  ".wav",
  ".aac",
  ".mp4",
  ".3gp",
  ".ogg",
  ".webm",
]);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, UPLOAD_DIR);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return callback(
        new Error(
          "Unsupported audio format. Use M4A, MP3, WAV, AAC, MP4, 3GP, OGG, or WEBM."
        )
      );
    }

    callback(null, true);
  },
});

// Every recording endpoint requires an authenticated user.
router.use(requireAuth);

// Upload a recording for a lecture owned by the signed-in student.
router.post(
  "/lecture/:lectureId",
  upload.single("recording"),
  async (req, res) => {
    let savedFilePath = null;

    try {
      const { lectureId } = req.params;
      const userId = req.auth.userId;

      if (!req.file) {
        return res.status(400).json({
          message: "Please select an audio recording to upload.",
        });
      }

      savedFilePath = req.file.path;

      const lectureResult = await pool.query(
        `
          SELECT l.id
          FROM lectures l
          JOIN modules m ON m.id = l.module_id
          WHERE l.id = $1
            AND m.user_id = $2
        `,
        [lectureId, userId]
      );

      if (lectureResult.rowCount === 0) {
        fs.unlink(savedFilePath, () => {});

        return res.status(404).json({
          message: "Lecture not found or you do not have access to it.",
        });
      }

      const title =
        typeof req.body.title === "string" &&
        req.body.title.trim()
          ? req.body.title.trim().slice(0, 200)
          : path.basename(
              req.file.originalname,
              path.extname(req.file.originalname)
            ).slice(0, 200) || "Lecture recording";

      const result = await pool.query(
        `
          INSERT INTO recordings (
            user_id,
            lecture_id,
            title,
            stored_filename,
            original_filename,
            mime_type,
            file_size
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING
            id,
            lecture_id,
            title,
            original_filename,
            mime_type,
            file_size,
            created_at
        `,
        [
          userId,
          lectureId,
          title,
          req.file.filename,
          path.basename(req.file.originalname).slice(0, 255),
          req.file.mimetype || "application/octet-stream",
          req.file.size,
        ]
      );

      return res.status(201).json({
        message: "Recording uploaded successfully.",
        recording: result.rows[0],
      });
    } catch (error) {
      if (savedFilePath) {
        fs.unlink(savedFilePath, () => {});
      }

      console.error("Recording upload error:", error);

      return res.status(500).json({
        message: "Could not upload the recording.",
      });
    }
  }
);

// List recordings belonging to a lecture owned by the signed-in student.
router.get("/lecture/:lectureId", async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.auth.userId;

    const result = await pool.query(
      `
        SELECT
          r.id,
          r.lecture_id,
          r.title,
          r.original_filename,
          r.mime_type,
          r.file_size,
          r.created_at
        FROM recordings r
        JOIN lectures l ON l.id = r.lecture_id
        JOIN modules m ON m.id = l.module_id
        WHERE r.lecture_id = $1
          AND m.user_id = $2
          AND r.user_id = $2
        ORDER BY r.created_at DESC
      `,
      [lectureId, userId]
    );

    return res.json({ recordings: result.rows });
  } catch (error) {
    console.error("List recordings error:", error);

    return res.status(500).json({
      message: "Could not retrieve recordings.",
    });
  }
});

// Download a recording only if it belongs to the signed-in student.
router.get("/:recordingId/file", async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT r.stored_filename, r.original_filename
        FROM recordings r
        JOIN lectures l ON l.id = r.lecture_id
        JOIN modules m ON m.id = l.module_id
        WHERE r.id = $1
          AND r.user_id = $2
          AND m.user_id = $2
      `,
      [req.params.recordingId, req.auth.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Recording not found or you do not have access to it.",
      });
    }

    const recording = result.rows[0];
    const filePath = path.join(
      UPLOAD_DIR,
      recording.stored_filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "The recording file could not be found.",
      });
    }

    return res.download(
      filePath,
      recording.original_filename
    );
  } catch (error) {
    console.error("Download recording error:", error);

    return res.status(500).json({
      message: "Could not retrieve the recording file.",
    });
  }
});

// Delete a recording and its stored audio file.
router.delete("/:recordingId", async (req, res) => {
  try {
    const result = await pool.query(
      `
        DELETE FROM recordings r
        USING lectures l, modules m
        WHERE r.id = $1
          AND r.user_id = $2
          AND l.id = r.lecture_id
          AND m.id = l.module_id
          AND m.user_id = $2
        RETURNING r.stored_filename
      `,
      [req.params.recordingId, req.auth.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Recording not found or you do not have access to it.",
      });
    }

    const filePath = path.join(
      UPLOAD_DIR,
      result.rows[0].stored_filename
    );

    fs.unlink(filePath, (error) => {
      if (error && error.code !== "ENOENT") {
        console.error("Could not delete recording file:", error);
      }
    });

    return res.json({
      message: "Recording deleted successfully.",
    });
  } catch (error) {
    console.error("Delete recording error:", error);

    return res.status(500).json({
      message: "Could not delete the recording.",
    });
  }
});

module.exports = router;
