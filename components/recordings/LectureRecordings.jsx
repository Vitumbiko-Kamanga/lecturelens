import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../services/api";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const MUTED = "#667085";
const RED = "#B42318";

// Convert seconds into mm:ss.
function formatTime(seconds = 0) {
  const safeSeconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatSize(bytes) {
  const size = Number(bytes) || 0;

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

// Escape transcript content before inserting it into HTML.
function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Detect possible author-year citations in lecture transcripts.
function detectCitationCandidates(transcript = "") {
  if (!transcript || typeof transcript !== "string") {
    return [];
  }

  const patterns = [
    /\b([A-Z][a-zA-Z'-]+)\s+\((\d{4})\)/g,
    /\b([A-Z][a-zA-Z'-]+)\s+et\s+al\.?\s*\((\d{4})\)/g,
    /\b([A-Z][a-zA-Z'-]+),?\s+et\s+al\.?[,]?\s+(\d{4})\b/g,
  ];

  const candidates = [];
  const seen = new Set();

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(transcript)) !== null) {
      const author = match[1];
      const year = match[2];
      const key = `${author.toLowerCase()}-${year}`;

      if (!seen.has(key)) {
        seen.add(key);

        candidates.push({
          author,
          year,
          query: `${author} ${year}`,
        });
      }
    }
  }

  return candidates;
}

// Convert Gemini output into a displayable string.
function getSummaryText(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([heading, content]) => {
        const section = Array.isArray(content)
          ? content.map((item) => `• ${String(item)}`).join("\n")
          : String(content ?? "");

        return `${heading}\n${section}`;
      })
      .join("\n\n")
      .trim();
  }

  return "";
}

export default function LectureRecordings({ lectureId }) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  // Whisper backup transcription.
  const [transcribingId, setTranscribingId] = useState(null);

  // Deepgram primary transcription.
  const [deepgramTranscribingId, setDeepgramTranscribingId] =
    useState(null);

  const [transcripts, setTranscripts] = useState({});
  const [transcriptLoadingId, setTranscriptLoadingId] = useState(null);
  const [expandedTranscriptId, setExpandedTranscriptId] = useState(null);

  // Gemini AI summarization.
  const [summarizingId, setSummarizingId] = useState(null);
  const [summaries, setSummaries] = useState({});

  // Citation detection and academic search states.
  const [citationCandidates, setCitationCandidates] = useState({});
  const [citationResults, setCitationResults] = useState({});
  const [citationSearchLoading, setCitationSearchLoading] = useState(null);

  // PDF export loading state.
  const [exportingTranscriptId, setExportingTranscriptId] = useState(null);

  const loadRecordings = useCallback(async () => {
    try {
      setError("");

      const result = await api.listRecordings(lectureId);

      const items = Array.isArray(result)
        ? result
        : result?.recordings || [];

      setRecordings(items);
    } catch (err) {
      setError(err.message || "Could not load recordings.");
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  useEffect(() => {
    setLoading(true);
    loadRecordings();
  }, [loadRecordings]);

  async function handlePlayback(recording) {
    if (busyId) return;

    try {
      setBusyId(String(recording.id));
      setError("");

      if (String(playingId) === String(recording.id)) {
        if (status.playing) {
          player.pause();
        } else {
          player.play();
        }

        return;
      }

      const source = await api.getRecordingPlaybackSource(recording.id);

      player.pause();
      player.replace(source);

      setPlayingId(String(recording.id));

      player.play();
    } catch (err) {
      setError(err.message || "Could not play this recording.");
    } finally {
      setBusyId(null);
    }
  }

  // Whisper transcription is retained as the backup option.
  async function handleTranscribe(recording) {
    const recordingId = String(recording.id);

    if (
      transcribingId ||
      deepgramTranscribingId ||
      transcriptLoadingId ||
      summarizingId
    ) {
      return;
    }

    try {
      setTranscribingId(recordingId);
      setError("");

      const result = await api.transcribeRecording(recording.id);
      const transcript = result?.transcript;

      if (!transcript) {
        throw new Error("The server did not return the saved transcript.");
      }

      setTranscripts((previous) => ({
        ...previous,
        [recordingId]: transcript,
      }));

      const candidates = detectCitationCandidates(
        transcript.transcript || ""
      );

      setCitationCandidates((previous) => ({
        ...previous,
        [recordingId]: candidates,
      }));

      setCitationResults((previous) => ({
        ...previous,
        [recordingId]: {},
      }));

      // A new transcript means any previous summary is outdated.
      setSummaries((previous) => {
        const updated = { ...previous };
        delete updated[recordingId];
        return updated;
      });

      setExpandedTranscriptId(recordingId);

      Alert.alert(
        "Whisper transcription complete",
        candidates.length > 0
          ? `Backup transcript saved. Found ${candidates.length} possible citation(s).`
          : "Backup transcript saved. No author-year citations were detected."
      );
    } catch (err) {
      Alert.alert(
        "Whisper transcription failed",
        err.message || "Could not transcribe this recording with Whisper."
      );
    } finally {
      setTranscribingId(null);
    }
  }

  // Deepgram is the primary transcription service.
  async function handleTranscribeDeepgram(recording) {
    const recordingId = String(recording.id);

    if (
      transcribingId ||
      deepgramTranscribingId ||
      transcriptLoadingId ||
      summarizingId
    ) {
      return;
    }

    try {
      setDeepgramTranscribingId(recordingId);
      setError("");

      const result = await api.transcribeRecordingDeepgram(recording.id);
      const transcript = result?.transcript;

      if (!transcript) {
        throw new Error("Deepgram did not return the saved transcript.");
      }

      setTranscripts((previous) => ({
        ...previous,
        [recordingId]: transcript,
      }));

      const candidates = detectCitationCandidates(
        transcript.transcript || ""
      );

      setCitationCandidates((previous) => ({
        ...previous,
        [recordingId]: candidates,
      }));

      setCitationResults((previous) => ({
        ...previous,
        [recordingId]: {},
      }));

      // Clear any old summary because the transcript has changed.
      setSummaries((previous) => {
        const updated = { ...previous };
        delete updated[recordingId];
        return updated;
      });

      setExpandedTranscriptId(recordingId);

      Alert.alert(
        "Deepgram transcription complete",
        candidates.length > 0
          ? `Transcript saved. Found ${candidates.length} possible citation(s).`
          : "Transcript saved. No author-year citations were detected."
      );
    } catch (err) {
      const errorMessage =
        err.message || "Could not transcribe this recording with Deepgram.";

      setError(errorMessage);

      // Offer Whisper as a backup if Deepgram fails.
      Alert.alert(
        "Deepgram transcription failed",
        `${errorMessage}\n\nWould you like to try Whisper as a backup?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Use Whisper",
            onPress: () => handleTranscribe(recording),
          },
        ]
      );
    } finally {
      setDeepgramTranscribingId(null);
    }
  }

  async function handleViewTranscript(recording) {
    const recordingId = String(recording.id);

    if (
      transcriptLoadingId ||
      transcribingId ||
      deepgramTranscribingId ||
      summarizingId
    ) {
      return;
    }

    if (expandedTranscriptId === recordingId) {
      setExpandedTranscriptId(null);
      return;
    }

    try {
      setTranscriptLoadingId(recordingId);
      setError("");

      const result = await api.getRecordingTranscript(recording.id);
      const transcript = result?.transcript;

      if (!transcript) {
        throw new Error("The server did not return the transcript.");
      }

      setTranscripts((previous) => ({
        ...previous,
        [recordingId]: transcript,
      }));

      const candidates = detectCitationCandidates(
        transcript.transcript || ""
      );

      setCitationCandidates((previous) => ({
        ...previous,
        [recordingId]: candidates,
      }));

      setExpandedTranscriptId(recordingId);
    } catch (err) {
      setError(err.message || "Could not load the transcript.");
    } finally {
      setTranscriptLoadingId(null);
    }
  }

  // Generate a Gemini summary from the saved transcript.
  async function handleSummarizeRecording(recording) {
    const recordingId = String(recording.id);
    const transcript = transcripts[recordingId];

    if (
      summarizingId ||
      transcribingId ||
      deepgramTranscribingId ||
      transcriptLoadingId
    ) {
      return;
    }

    if (!transcript?.transcript?.trim()) {
      Alert.alert(
        "Transcript required",
        "Please transcribe this recording first before generating an AI summary."
      );

      return;
    }

    try {
      setSummarizingId(recordingId);
      setError("");

      const result = await api.summarizeRecording(recording.id);
      const summaryText = getSummaryText(result?.summary);

      if (!summaryText) {
        throw new Error(
          "The AI service did not return a summary. Please try again."
        );
      }

      setSummaries((previous) => ({
        ...previous,
        [recordingId]: summaryText,
      }));

      Alert.alert(
        "AI summary generated",
        "Your lecture summary and revision material are ready."
      );
    } catch (err) {
      Alert.alert(
        "AI summarization failed",
        err.message || "Could not generate the lecture summary."
      );
    } finally {
      setSummarizingId(null);
    }
  }

  // Export a saved transcript as a PDF and open the sharing dialog.
  async function handleExportTranscript(recording, transcript) {
    const recordingId = String(recording.id);

    if (exportingTranscriptId) return;

    try {
      setExportingTranscriptId(recordingId);

      const recordingTitle =
        recording.title || "Lecture recording";

      const recordingDate = recording.created_at
        ? new Date(recording.created_at).toLocaleDateString()
        : "Date unavailable";

      const language = transcript.language || "Unknown";

      const duration =
        transcript.duration_seconds != null
          ? formatTime(transcript.duration_seconds)
          : "Unavailable";

      const transcriptText =
        typeof transcript.transcript === "string" &&
        transcript.transcript.trim()
          ? transcript.transcript
          : "No speech was recognized in this recording.";

      const segments = Array.isArray(transcript.segments)
        ? transcript.segments
        : [];

      const segmentsHtml =
        segments.length > 0
          ? `
            <section class="segments">
              <h2>Timestamped segments</h2>
              ${segments
                .map(
                  (segment) => `
                    <div class="segment">
                      <span class="timestamp">${escapeHtml(
                        formatTime(segment.start)
                      )}</span>
                      <span class="segment-text">${escapeHtml(
                        segment.text || ""
                      )}</span>
                    </div>
                  `
                )
                .join("")}
            </section>
          `
          : "";

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              @page {
                margin: 24px;
              }
              body {
                font-family: Arial, Helvetica, sans-serif;
                color: #101828;
                font-size: 12px;
                line-height: 1.6;
              }
              .header {
                border-bottom: 3px solid ${GOLD};
                padding-bottom: 14px;
                margin-bottom: 20px;
              }
              .brand {
                color: ${NAVY};
                font-size: 12px;
                font-weight: bold;
                letter-spacing: 1px;
              }
              h1 {
                color: ${NAVY};
                font-size: 23px;
                margin: 8px 0;
                overflow-wrap: break-word;
              }
              .metadata {
                color: #667085;
                font-size: 11px;
                margin-top: 10px;
              }
              .metadata p {
                margin: 3px 0;
              }
              h2 {
                color: ${NAVY};
                font-size: 16px;
                margin-top: 24px;
                margin-bottom: 10px;
              }
              .transcript {
                white-space: pre-wrap;
                overflow-wrap: break-word;
                font-size: 12px;
                line-height: 1.8;
              }
              .segments {
                margin-top: 24px;
                page-break-inside: auto;
              }
              .segment {
                display: flex;
                align-items: flex-start;
                margin-bottom: 10px;
                page-break-inside: avoid;
              }
              .timestamp {
                color: ${NAVY};
                font-weight: bold;
                min-width: 48px;
                margin-right: 10px;
              }
              .segment-text {
                flex: 1;
                overflow-wrap: break-word;
              }
              .footer {
                border-top: 1px solid #E5EAF0;
                margin-top: 30px;
                padding-top: 10px;
                color: #667085;
                font-size: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="brand">LECTURELENS</div>
              <h1>${escapeHtml(recordingTitle)}</h1>
              <div class="metadata">
                <p><strong>Recording date:</strong> ${escapeHtml(recordingDate)}</p>
                <p><strong>Language:</strong> ${escapeHtml(language)}</p>
                <p><strong>Duration:</strong> ${escapeHtml(duration)}</p>
              </div>
            </div>
            <section>
              <h2>Lecture transcript</h2>
              <div class="transcript">${escapeHtml(transcriptText)}</div>
            </section>
            ${segmentsHtml}
            <div class="footer">
              Exported from LectureLens
            </div>
          </body>
        </html>
      `;

      const pdf = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (!pdf?.uri) {
        throw new Error("The PDF file could not be generated.");
      }

      const sharingAvailable = await Sharing.isAvailableAsync();

      if (!sharingAvailable) {
        Alert.alert(
          "PDF created",
          "The transcript PDF was created, but sharing is not available on this device."
        );

        return;
      }

      await Sharing.shareAsync(pdf.uri, {
        mimeType: "application/pdf",
        dialogTitle: `Share ${recordingTitle} transcript`,
        UTI: "com.adobe.pdf",
      });
    } catch (err) {
      Alert.alert(
        "PDF export failed",
        err.message || "Could not export this transcript."
      );
    } finally {
      setExportingTranscriptId(null);
    }
  }

  // Search Crossref for a detected citation.
  async function handleSearchCitation(recordingId, citation) {
    const citationKey = `${citation.author}-${citation.year}`;

    if (citationSearchLoading) return;

    try {
      setCitationSearchLoading(citationKey);

      const results = await api.searchAcademicReferences(
        citation.query
      );

      setCitationResults((previous) => ({
        ...previous,
        [recordingId]: {
          ...(previous[recordingId] || {}),
          [citationKey]: results,
        },
      }));

      if (results.length === 0) {
        Alert.alert(
          "No publications found",
          `No matching publications were found for ${citation.author} (${citation.year}).`
        );
      }
    } catch (err) {
      Alert.alert(
        "Reference search failed",
        err.message || "Could not search for this citation."
      );
    } finally {
      setCitationSearchLoading(null);
    }
  }

  async function openReference(url) {
    if (!url) return;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to open publication",
        "Could not open the publication link."
      );
    }
  }

  function confirmDelete(recording) {
    Alert.alert(
      "Delete recording?",
      `Delete "${recording.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setBusyId(String(recording.id));

              if (String(playingId) === String(recording.id)) {
                player.pause();
                player.replace(null);
                setPlayingId(null);
              }

              await api.deleteRecording(recording.id);

              setRecordings((previous) =>
                previous.filter(
                  (item) => String(item.id) !== String(recording.id)
                )
              );

              // Clear cached transcript for deleted recording.
              setTranscripts((previous) => {
                const updated = { ...previous };
                delete updated[String(recording.id)];
                return updated;
              });

              // Clear cached summary for deleted recording.
              setSummaries((previous) => {
                const updated = { ...previous };
                delete updated[String(recording.id)];
                return updated;
              });
            } catch (err) {
              Alert.alert(
                "Could not delete recording",
                err.message || "Please try again."
              );
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  }

  const isLoaded = Boolean(status.isLoaded);
  const duration = Number(status.duration) || 0;
  const currentTime = Number(status.currentTime) || 0;

  const progress =
    duration > 0
      ? Math.min(100, (currentTime / duration) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <Ionicons
          name="musical-notes-outline"
          size={19}
          color={NAVY}
        />

        <Text style={styles.heading}>Lecture recordings</Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{recordings.length}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={NAVY} style={styles.loader} />
      ) : error && recordings.length === 0 ? (
        <View style={styles.messageBox}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity onPress={loadRecordings}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : recordings.length === 0 ? (
        <Text style={styles.emptyText}>
          No recordings uploaded for this lecture yet.
        </Text>
      ) : (
        recordings.map((recording) => {
          const recordingId = String(recording.id);
          const selected = recordingId === String(playingId);
          const transcript = transcripts[recordingId];
          const summary = summaries[recordingId];
          const candidates = citationCandidates[recordingId] || [];

          const transcriptionBusy =
            Boolean(
              transcribingId ||
              deepgramTranscribingId ||
              transcriptLoadingId ||
              summarizingId ||
              busyId
            );

          return (
            <View key={recording.id} style={styles.recordingCard}>
              <View style={styles.recordingTop}>
                <View style={styles.audioIcon}>
                  <Ionicons
                    name="musical-note"
                    size={21}
                    color={NAVY}
                  />
                </View>

                <View style={styles.recordingInfo}>
                  <Text style={styles.recordingTitle}>
                    {recording.title || "Lecture recording"}
                  </Text>

                  <Text style={styles.metadata}>
                    {formatSize(recording.file_size)}
                    {recording.created_at
                      ? `  ·  ${new Date(
                          recording.created_at
                        ).toLocaleDateString()}`
                      : ""}
                  </Text>
                </View>

                <TouchableOpacity
                  accessibilityLabel="Delete recording"
                  onPress={() => confirmDelete(recording)}
                  disabled={Boolean(busyId)}
                  style={styles.deleteButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color={RED}
                  />
                </TouchableOpacity>
              </View>

              {/* Audio playback */}
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => handlePlayback(recording)}
                  disabled={Boolean(busyId)}
                  accessibilityLabel={
                    selected && status.playing
                      ? "Pause recording"
                      : "Play recording"
                  }
                >
                  {busyId === recordingId ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />
                  ) : (
                    <Ionicons
                      name={
                        selected && status.playing
                          ? "pause"
                          : "play"
                      }
                      size={19}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>

                <View style={styles.progressArea}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${selected ? progress : 0}%`,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.timeRow}>
                    <Text style={styles.timeText}>
                      {selected ? formatTime(currentTime) : "0:00"}
                    </Text>

                    <Text style={styles.timeText}>
                      {selected && isLoaded
                        ? formatTime(duration)
                        : "Audio"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Deepgram primary transcription and transcript viewing */}
              <View style={styles.transcriptionActions}>
                <TouchableOpacity
                  style={styles.deepgramButton}
                  onPress={() => handleTranscribeDeepgram(recording)}
                  disabled={transcriptionBusy}
                >
                  {deepgramTranscribingId === recordingId ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />
                  ) : (
                    <Ionicons
                      name="sparkles-outline"
                      size={17}
                      color="#FFFFFF"
                    />
                  )}

                  <Text style={styles.transcribeButtonText}>
                    {deepgramTranscribingId === recordingId
                      ? "Transcribing..."
                      : "Transcribe recording"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewTranscriptButton}
                  onPress={() => handleViewTranscript(recording)}
                  disabled={transcriptionBusy}
                >
                  {transcriptLoadingId === recordingId ? (
                    <ActivityIndicator
                      color={NAVY}
                      size="small"
                    />
                  ) : (
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color={NAVY}
                    />
                  )}

                  <Text style={styles.viewTranscriptButtonText}>
                    {expandedTranscriptId === recordingId
                      ? "Hide transcript"
                      : "View transcript"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Transcript display */}
              {expandedTranscriptId === recordingId && transcript && (
                <View style={styles.transcriptCard}>
                  <Text style={styles.transcriptHeading}>
                    Transcript
                  </Text>

                  <Text style={styles.transcriptMetadata}>
                    Language: {transcript.language || "Unknown"}
                    {transcript.duration_seconds != null
                      ? `  ·  ${formatTime(
                          transcript.duration_seconds
                        )}`
                      : ""}
                  </Text>

                  {/* PDF export action */}
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() =>
                      handleExportTranscript(recording, transcript)
                    }
                    disabled={Boolean(exportingTranscriptId)}
                  >
                    {exportingTranscriptId === recordingId ? (
                      <ActivityIndicator
                        color="#FFFFFF"
                        size="small"
                      />
                    ) : (
                      <Ionicons
                        name="document-outline"
                        size={17}
                        color="#FFFFFF"
                      />
                    )}

                    <Text style={styles.exportButtonText}>
                      {exportingTranscriptId === recordingId
                        ? "Preparing PDF..."
                        : "Export transcript to PDF"}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.transcriptText}>
                    {transcript.transcript ||
                      "No speech was recognized in this recording."}
                  </Text>

                  {/* Gemini AI summarization */}
                  <View style={styles.aiSummaryContainer}>
                    <View style={styles.aiSummaryHeadingRow}>
                      <Ionicons
                        name="sparkles-outline"
                        size={20}
                        color={NAVY}
                      />

                      <Text style={styles.aiSummaryHeading}>
                        AI Lecture Summary
                      </Text>
                    </View>

                    <Text style={styles.aiSummaryDescription}>
                      Generate a concise lecture summary, key points,
                      definitions, and revision questions from this transcript.
                    </Text>

                    <TouchableOpacity
                      style={styles.summarizeButton}
                      onPress={() => handleSummarizeRecording(recording)}
                      disabled={Boolean(
                        summarizingId ||
                        transcribingId ||
                        deepgramTranscribingId ||
                        transcriptLoadingId
                      )}
                    >
                      {summarizingId === recordingId ? (
                        <ActivityIndicator
                          color="#FFFFFF"
                          size="small"
                        />
                      ) : (
                        <Ionicons
                          name="sparkles"
                          size={17}
                          color="#FFFFFF"
                        />
                      )}

                      <Text style={styles.summarizeButtonText}>
                        {summarizingId === recordingId
                          ? "Generating AI summary..."
                          : summary
                            ? "Regenerate AI summary"
                            : "Generate AI summary"}
                      </Text>
                    </TouchableOpacity>

                    {summary && (
                      <View style={styles.summaryResultCard}>
                        <View style={styles.summaryResultHeader}>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#027A48"
                          />

                          <Text style={styles.summaryResultTitle}>
                            Generated lecture summary
                          </Text>
                        </View>

                        <Text style={styles.summaryText}>
                          {summary}
                        </Text>

                        <Text style={styles.summaryDisclaimer}>
                          Review the AI-generated content against your
                          original lecture transcript before using it
                          for academic work.
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Timestamped segments */}
                  {Array.isArray(transcript.segments) &&
                    transcript.segments.length > 0 && (
                      <View style={styles.segmentsContainer}>
                        <Text style={styles.segmentsHeading}>
                          Timestamped segments
                        </Text>

                        {transcript.segments.map((segment, index) => (
                          <View
                            key={`${recording.id}-segment-${index}`}
                            style={styles.segmentRow}
                          >
                            <Text style={styles.segmentTime}>
                              {formatTime(segment.start)}
                            </Text>

                            <Text style={styles.segmentText}>
                              {segment.text}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                  {/* Citation detection */}
                  <View style={styles.citationContainer}>
                    <View style={styles.citationHeadingRow}>
                      <Ionicons
                        name="book-outline"
                        size={19}
                        color={NAVY}
                      />

                      <Text style={styles.citationHeading}>
                        Possible academic references
                      </Text>
                    </View>

                    {candidates.length === 0 ? (
                      <Text style={styles.citationEmptyText}>
                        No author-year citations were detected.
                        Try searching for references manually in the
                        References screen.
                      </Text>
                    ) : (
                      <>
                        <Text style={styles.citationDescription}>
                          These are possible citations detected in the
                          transcript. Verify the results before using
                          them in your academic work.
                        </Text>

                        {candidates.map((citation, index) => {
                          const citationKey =
                            `${citation.author}-${citation.year}`;

                          const results =
                            citationResults[recordingId]?.[citationKey];

                          return (
                            <View
                              key={`${citationKey}-${index}`}
                              style={styles.citationCard}
                            >
                              <Text style={styles.citationAuthor}>
                                {citation.author} ({citation.year})
                              </Text>

                              <TouchableOpacity
                                style={styles.citationSearchButton}
                                onPress={() =>
                                  handleSearchCitation(
                                    recordingId,
                                    citation
                                  )
                                }
                                disabled={Boolean(citationSearchLoading)}
                              >
                                {citationSearchLoading === citationKey ? (
                                  <ActivityIndicator
                                    color="#FFFFFF"
                                    size="small"
                                  />
                                ) : (
                                  <Ionicons
                                    name="search-outline"
                                    size={16}
                                    color="#FFFFFF"
                                  />
                                )}

                                <Text style={styles.citationSearchButtonText}>
                                  Search publication
                                </Text>
                              </TouchableOpacity>

                              {/* Academic search results */}
                              {Array.isArray(results) &&
                                results.map((reference, resultIndex) => (
                                  <TouchableOpacity
                                    key={
                                      reference.doi ||
                                      `${reference.title}-${resultIndex}`
                                    }
                                    style={styles.referenceResult}
                                    onPress={() =>
                                      openReference(reference.url)
                                    }
                                    disabled={!reference.url}
                                  >
                                    <Text style={styles.referenceTitle}>
                                      {reference.title}
                                    </Text>

                                    <Text style={styles.referenceMetadata}>
                                      {reference.authors ||
                                        "Authors unavailable"}
                                    </Text>

                                    <Text style={styles.referenceMetadata}>
                                      Year: {reference.year}
                                    </Text>

                                    <Text style={styles.referenceLink}>
                                      View publication
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                            </View>
                          );
                        })}
                      </>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })
      )}

      {!!error && recordings.length > 0 && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadRecordings}
        disabled={loading}
      >
        <Ionicons
          name="refresh-outline"
          size={16}
          color={NAVY}
        />

        <Text style={styles.refreshText}>
          Refresh recordings
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5EAF0",
  },

  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 7,
  },

  heading: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "700",
  },

  countBadge: {
    backgroundColor: "#FFF4D6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  countText: {
    color: NAVY,
    fontWeight: "700",
    fontSize: 12,
  },

  loader: {
    marginVertical: 16,
  },

  messageBox: {
    paddingVertical: 8,
  },

  emptyText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    paddingVertical: 6,
  },

  errorText: {
    color: RED,
    fontSize: 12,
    marginVertical: 6,
  },

  retryText: {
    color: NAVY,
    fontWeight: "700",
    marginTop: 8,
  },

  recordingCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 10,
    padding: 11,
    marginBottom: 9,
  },

  recordingTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  audioIcon: {
    height: 39,
    width: 39,
    borderRadius: 10,
    backgroundColor: "#FFF4D6",
    alignItems: "center",
    justifyContent: "center",
  },

  recordingInfo: {
    flex: 1,
  },

  recordingTitle: {
    color: "#101828",
    fontSize: 13,
    fontWeight: "700",
  },

  metadata: {
    color: MUTED,
    fontSize: 11,
    marginTop: 4,
  },

  deleteButton: {
    padding: 7,
  },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 12,
  },

  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },

  progressArea: {
    flex: 1,
  },

  progressTrack: {
    height: 5,
    backgroundColor: "#E4E7EC",
    borderRadius: 5,
    overflow: "hidden",
  },

  progressFill: {
    height: 5,
    backgroundColor: GOLD,
    borderRadius: 5,
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  timeText: {
    color: MUTED,
    fontSize: 11,
  },

  refreshButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    marginTop: 2,
  },

  refreshText: {
    color: NAVY,
    fontWeight: "600",
    fontSize: 12,
  },

  transcriptionActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  // Main Deepgram transcription button.
  deepgramButton: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: NAVY,
  },

  transcribeButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  viewTranscriptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#FFF4D6",
    borderWidth: 1,
    borderColor: GOLD,
  },

  viewTranscriptButtonText: {
    color: NAVY,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },

  transcriptCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 9,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },

  transcriptHeading: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "700",
  },

  transcriptMetadata: {
    color: MUTED,
    fontSize: 11,
    marginTop: 5,
    marginBottom: 10,
  },

  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: NAVY,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 10,
    marginBottom: 14,
  },

  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  transcriptText: {
    color: "#101828",
    fontSize: 13,
    lineHeight: 21,
  },

  // Gemini AI summary styles.
  aiSummaryContainer: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#E5EAF0",
  },

  aiSummaryHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },

  aiSummaryHeading: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "700",
  },

  aiSummaryDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },

  summarizeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: NAVY,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 10,
  },

  summarizeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  summaryResultCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: GOLD,
  },

  summaryResultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },

  summaryResultTitle: {
    flex: 1,
    color: NAVY,
    fontSize: 13,
    fontWeight: "700",
  },

  summaryText: {
    color: "#101828",
    fontSize: 13,
    lineHeight: 21,
  },

  summaryDisclaimer: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 12,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#E5EAF0",
  },

  segmentsContainer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5EAF0",
  },

  segmentsHeading: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },

  segmentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 9,
  },

  segmentTime: {
    minWidth: 40,
    color: NAVY,
    fontSize: 11,
    fontWeight: "700",
  },

  segmentText: {
    flex: 1,
    color: "#344054",
    fontSize: 12,
    lineHeight: 19,
  },

  // Citation detection styles.
  citationContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5EAF0",
  },

  citationHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },

  citationHeading: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "700",
  },

  citationDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },

  citationEmptyText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
  },

  citationCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF0",
    borderRadius: 8,
    padding: 10,
    marginTop: 9,
  },

  citationAuthor: {
    color: NAVY,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 8,
  },

  citationSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: NAVY,
    borderRadius: 7,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },

  citationSearchButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  referenceResult: {
    marginTop: 10,
    padding: 10,
    borderRadius: 7,
    backgroundColor: "#FFF9EA",
    borderWidth: 1,
    borderColor: "#F2B544",
  },

  referenceTitle: {
    color: NAVY,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },

  referenceMetadata: {
    color: MUTED,
    fontSize: 11,
    marginTop: 5,
  },

  referenceLink: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
});