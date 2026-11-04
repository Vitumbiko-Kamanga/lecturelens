
const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing from the environment.");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const MAX_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 2000;

/**
 * Wait before retrying a temporary Gemini API failure.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine whether the Gemini error is temporary.
 */
function isRetryableError(error) {
  const status = error?.status || error?.code;

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

/**
 * Generate an academic lecture summary and key points.
 *
 * @param {string} transcript - Original lecture transcript.
 * @returns {Promise<string>} AI-generated study material.
 */
async function summarizeTranscript(transcript) {
  if (typeof transcript !== "string" || !transcript.trim()) {
    throw new Error("A valid lecture transcript is required.");
  }

  const prompt = `
You are LectureLens, an academic study assistant for university students.

Analyze the lecture transcript provided below.

Produce the following sections:

1. LECTURE SUMMARY
Write a clear, structured summary of the main ideas.

2. KEY POINTS
Identify the most important concepts discussed.

3. IMPORTANT DEFINITIONS
Explain technical terms that are explicitly discussed.

4. REVISION QUESTIONS
Create five questions that help students review the lecture.

Important instructions:
- Use clear academic English appropriate for university students.
- Preserve the lecturer's intended meaning.
- Do not invent facts, examples, definitions, or conclusions.
- If information is missing, explicitly state that it was not provided.
- Do not answer revision questions.
- Do not include information unrelated to the transcript.

LECTURE TRANSCRIPT:

${transcript}
`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(
        `Gemini summarization attempt ${attempt}/${MAX_ATTEMPTS} using ${MODEL}`
      );

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 4000,
        },
      });

      const summary = response.text;

      if (!summary || !summary.trim()) {
        throw new Error("Gemini returned an empty summary.");
      }

      console.log("Gemini lecture summary generated successfully.");

      return summary.trim();
    } catch (error) {
      console.error("Gemini summarization attempt failed:", {
        attempt,
        status: error?.status,
        message: error?.message,
      });

      if (!isRetryableError(error) || attempt === MAX_ATTEMPTS) {
        throw error;
      }

      const retryDelay =
        INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);

      console.log(
        `Gemini temporarily unavailable. Retrying in ${retryDelay / 1000} seconds...`
      );

      await delay(retryDelay);
    }
  }

  throw new Error("Gemini summarization failed after multiple attempts.");
}

module.exports = {
  summarizeTranscript,
};
