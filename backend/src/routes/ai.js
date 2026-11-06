const express = require("express");

const pool = require("../config/database");
const requireAuth = require("../middleware/requireAuth");
const { answerLectureQuestion } = require("../services/geminiService");

const router = express.Router();

router.use(requireAuth);

router.post("/recordings/:recordingId/ask", async (req, res) => {
  try {
    const { recordingId } = req.params;
    const userId = req.auth.userId;

    const question =
      typeof req.body.question === "string"
        ? req.body.question.trim()
        : "";

    if (!question) {
      return res.status(400).json({
        message: "Please enter a question about your lecture.",
      });
    }

    if (question.length > 2000) {
      return res.status(400).json({
        message: "Your question is too long. Please use 2,000 characters or fewer.",
      });
    }

    const result = await pool.query(
      `
        SELECT
          t.transcript,
          r.title AS recording_title
        FROM transcripts t
        JOIN recordings r ON r.id = t.recording_id
        JOIN lectures l ON l.id = r.lecture_id
        JOIN modules m ON m.id = l.module_id
        WHERE r.id = $1
          AND r.user_id = $2
          AND m.user_id = $2
          AND t.user_id = $2
      `,
      [recordingId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message:
          "Transcript not found or you do not have access to this recording. Transcribe the lecture first.",
      });
    }

    const { transcript, recording_title } = result.rows[0];

    if (typeof transcript !== "string" || !transcript.trim()) {
      return res.status(400).json({
        message: "The saved lecture transcript is empty.",
      });
    }

    if (transcript.length > 100000) {
      return res.status(413).json({
        message:
          "This transcript is too long to use with Ask AI. Please use a shorter lecture transcript.",
      });
    }

    const answer = await answerLectureQuestion({
      question,
      transcript,
      lectureTitle: recording_title,
    });

    return res.json({
      message: "Lecture question answered successfully.",
      recordingId,
      recordingTitle: recording_title,
      question,
      answer,
    });
  } catch (error) {
    console.error("Ask AI error:", error);

    if (error?.status === 429) {
      return res.status(429).json({
        message:
          "The AI service is receiving too many requests. Please wait a moment and try again.",
      });
    }

    if (
      error?.status === 503 ||
      error?.status === 502 ||
      error?.status === 504
    ) {
      return res.status(503).json({
        message:
          "The AI service is temporarily unavailable. Please try again later.",
      });
    }

    return res.status(500).json({
      message: "Could not answer your lecture question.",
    });
  }
});

module.exports = router;
