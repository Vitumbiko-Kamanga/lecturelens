
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../services/api";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const MUTED = "#667085";
const RED = "#B42318";

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

export default function LectureRecordings({ lectureId }) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const [transcribingId, setTranscribingId] = useState(null);
  const [transcripts, setTranscripts] = useState({});
  const [transcriptLoadingId, setTranscriptLoadingId] = useState(null);
  const [expandedTranscriptId, setExpandedTranscriptId] = useState(null);

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

      // Pause the currently playing recording when the same item is selected.
      if (String(playingId) === String(recording.id)) {
        if (status.playing) {
          player.pause();
        } else {
          player.play();
        }

        return;
      }

      // The API returns a protected audio URL with the Clerk bearer token.
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

  async function handleTranscribe(recording) {
    const recordingId = String(recording.id);

    if (transcribingId || transcriptLoadingId) return;

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

      setExpandedTranscriptId(recordingId);
      Alert.alert("Transcription complete", "Your transcript has been saved.");
    } catch (err) {
      setError(err.message || "Could not transcribe this recording.");
    } finally {
      setTranscribingId(null);
    }
  }

  async function handleViewTranscript(recording) {
    const recordingId = String(recording.id);

    if (transcriptLoadingId || transcribingId) return;

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

      setExpandedTranscriptId(recordingId);
    } catch (err) {
      setError(err.message || "Could not load the transcript.");
    } finally {
      setTranscriptLoadingId(null);
    }
  }


  function confirmDelete(recording) {
    Alert.alert(
      "Delete recording?",
      `Delete "${recording.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
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
        <Ionicons name="musical-notes-outline" size={19} color={NAVY} />
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
          const selected =
            String(playingId) === String(recording.id);

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
                  {busyId === String(recording.id) ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
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
  <View style={styles.transcriptionActions}>
    <TouchableOpacity
      style={styles.transcribeButton}
      onPress={() => handleTranscribe(recording)}
      disabled={Boolean(transcribingId || transcriptLoadingId || busyId)}
    >
      {transcribingId === String(recording.id) ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Ionicons name="text-outline" size={17} color="#FFFFFF" />
      )}
      <Text style={styles.transcribeButtonText}>
        {transcribingId === String(recording.id)
          ? "Transcribing..."
          : "Transcribe"}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.viewTranscriptButton}
      onPress={() => handleViewTranscript(recording)}
      disabled={Boolean(transcribingId || transcriptLoadingId || busyId)}
    >
      {transcriptLoadingId === String(recording.id) ? (
        <ActivityIndicator color={NAVY} size="small" />
      ) : (
        <Ionicons
          name="document-text-outline"
          size={17}
          color={NAVY}
        />
      )}
      <Text style={styles.viewTranscriptButtonText}>
        {expandedTranscriptId === String(recording.id)
          ? "Hide transcript"
          : "View transcript"}
      </Text>
    </TouchableOpacity>
  </View>

  {expandedTranscriptId === String(recording.id) &&
    transcripts[String(recording.id)] && (
      <View style={styles.transcriptCard}>
        <Text style={styles.transcriptHeading}>Transcript</Text>

        <Text style={styles.transcriptMetadata}>
          Language: {transcripts[String(recording.id)].language || "Unknown"}
          {transcripts[String(recording.id)].duration_seconds != null
            ? `  ·  ${formatTime(
                transcripts[String(recording.id)].duration_seconds
              )}`
            : ""}
        </Text>

        <Text style={styles.transcriptText}>
          {transcripts[String(recording.id)].transcript ||
            "No speech was recognized in this recording."}
        </Text>

        {Array.isArray(transcripts[String(recording.id)].segments) &&
          transcripts[String(recording.id)].segments.length > 0 && (
            <View style={styles.segmentsContainer}>
              <Text style={styles.segmentsHeading}>
                Timestamped segments
              </Text>

              {transcripts[String(recording.id)].segments.map(
                (segment, index) => (
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
                )
              )}
            </View>
          )}
      </View>
    )}

                </View>
              </View>
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
        <Ionicons name="refresh-outline" size={16} color={NAVY} />
        <Text style={styles.refreshText}>Refresh recordings</Text>
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
  transcribeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: NAVY,
  },
  transcribeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
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
    fontSize: 12,
    fontWeight: "700",
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
  transcriptText: {
    color: "#101828",
    fontSize: 13,
    lineHeight: 21,
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

});
