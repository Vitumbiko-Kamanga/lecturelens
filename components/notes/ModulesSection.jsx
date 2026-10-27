
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../services/api";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const MUTED = "#667085";

function getItems(result, key) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.[key])) return result[key];
  return [];
}

export default function ModulesSection() {
  const [modules, setModules] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [lecturesByModule, setLecturesByModule] = useState({});
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [notes, setNotes] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [recordingsLoading, setRecordingsLoading] = useState(false);
  const [recordingsError, setRecordingsError] = useState("");

  const [transcriptsByRecording, setTranscriptsByRecording] = useState({});
  const [expandedTranscriptId, setExpandedTranscriptId] = useState(null);
  const [transcriptLoadingId, setTranscriptLoadingId] = useState(null);
  const [transcriptErrors, setTranscriptErrors] = useState({});
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lecturesLoading, setLecturesLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadModules = useCallback(async () => {
    try {
      setError("");
      const result = await api.listModules();
      setModules(getItems(result, "modules"));
    } catch (err) {
      setError(err.message || "Could not load modules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  async function toggleModule(module) {
    if (expandedModule === module.id) {
      setExpandedModule(null);
      setSelectedLecture(null);
      setNotes([]);
      return;
    }

    setExpandedModule(module.id);
    setSelectedLecture(null);
    setNotes([]);
    setLecturesLoading(true);
    setError("");

    try {
      const result = await api.listLectures(module.id);
      setLecturesByModule((previous) => ({
        ...previous,
        [module.id]: getItems(result, "lectures"),
      }));
    } catch (err) {
      setError(err.message || "Could not load lectures.");
    } finally {
      setLecturesLoading(false);
    }
  }
async function openLecture(lecture) {
  setSelectedLecture(lecture);
  setNotes([]);
  setRecordings([]);
  setTranscriptSearch("");
  setExpandedTranscriptId(null);
  setNotesLoading(true);
  setRecordingsLoading(true);
  setError("");
  setRecordingsError("");
  setTranscriptSearch("");
  setSearchSubmitted("");
  setSearchResults([]);
  setSearchError("");

  // Load notes without preventing recordings from loading if notes fail.
  try {
    const result = await api.listNotes(lecture.id);
    setNotes(getItems(result, "notes"));
  } catch (err) {
    setError(err.message || "Could not load notes.");
  } finally {
    setNotesLoading(false);
  }

  // Load recordings belonging to this lecture.
  try {
    const result = await api.listRecordings(lecture.id);
    setRecordings(getItems(result, "recordings"));
  } catch (err) {
    setRecordingsError(
      err.message || "Could not load lecture recordings."
    );
  } finally {
    setRecordingsLoading(false);
  }
}


async function toggleTranscript(recording) {
  const recordingId = recording.id;

  // Close the transcript if it is already open.
  if (expandedTranscriptId === recordingId) {
    setExpandedTranscriptId(null);
    return;
  }

  // Reopen a transcript already fetched during this session.
  if (transcriptsByRecording[recordingId]) {
    setExpandedTranscriptId(recordingId);
    return;
  }

  setTranscriptLoadingId(recordingId);
  setTranscriptErrors((previous) => {
    const next = { ...previous };
    delete next[recordingId];
    return next;
  });

  try {
    const result = await api.getRecordingTranscript(recordingId);
    const savedTranscript = result?.transcript;

    if (!savedTranscript) {
      throw new Error("The transcript response was empty.");
    }

    setTranscriptsByRecording((previous) => ({
      ...previous,
      [recordingId]: savedTranscript,
    }));

    setExpandedTranscriptId(recordingId);
  } catch (err) {
    setTranscriptErrors((previous) => ({
      ...previous,
      [recordingId]:
        err.message || "Could not load this transcript.",
    }));
  } finally {
    setTranscriptLoadingId(null);
  }
}
const handleTranscriptSearch = async () => {
  const term = transcriptSearch.trim().toLowerCase();

  setSearchSubmitted(term);
  setSearchResults([]);
  setSearchError("");

  if (!term) {
    setSearchError("Please enter a word or phrase to search.");
    return;
  }

  if (recordings.length === 0) {
    setSearchError("There are no recordings to search for this lecture.");
    return;
  }

  setSearchLoading(true);

  try {
    const results = [];
    const updatedTranscripts = {};

    for (const recording of recordings) {
      try {
        const response = await api.getRecordingTranscript(recording.id);
        const transcript = response?.transcript;

        if (!transcript) {
          continue;
        }

        updatedTranscripts[recording.id] = transcript;

        const segments = Array.isArray(transcript.segments)
          ? transcript.segments
          : [];

        if (segments.length > 0) {
          segments.forEach((segment, index) => {
            const text = String(segment.text || "");

            if (text.toLowerCase().includes(term)) {
              results.push({
                recordingId: recording.id,
                recordingTitle:
                  recording.title ||
                  recording.original_filename ||
                  "Lecture recording",
                start: segment.start,
                end: segment.end,
                text,
                key: `${recording.id}-${index}`,
              });
            }
          });
        } else {
          const text = String(transcript.transcript || "");

          if (text.toLowerCase().includes(term)) {
            results.push({
              recordingId: recording.id,
              recordingTitle:
                recording.title ||
                recording.original_filename ||
                "Lecture recording",
              text,
              key: `${recording.id}-full`,
            });
          }
        }
      } catch (error) {
        // A missing transcript for one recording should not
        // prevent the other recordings from being searched.
        console.log(
          `Could not search transcript for recording ${recording.id}:`,
          error.message
        );
      }
    }

    setTranscriptsByRecording((previous) => ({
      ...previous,
      ...updatedTranscripts,
    }));

    setSearchResults(results);

    if (results.length === 0) {
      setSearchError(
        `No matches found for "${transcriptSearch.trim()}".`
      );
    }
  } catch (error) {
    setSearchError(
      error.message || "Unable to search saved transcripts."
    );
  } finally {
    setSearchLoading(false);
  }
};

function formatTimestamp(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

 
  async function saveNote() {
    if (!selectedLecture) {
      Alert.alert("Select a lecture", "Choose a lecture before saving a note.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      Alert.alert(
        "Complete your note",
        "Enter both a note title and some content."
      );
      return;
    }

    setSaving(true);

    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
      };

      if (editingNoteId !== null) {
        const result = await api.updateNote(editingNoteId, noteData);
        const updatedNote = result?.note || result;

        if (!updatedNote?.id) {
          throw new Error("The updated note was not returned by the server.");
        }

        setNotes((previous) =>
          previous.map((note) =>
            note.id === updatedNote.id ? updatedNote : note
          )
        );

        Alert.alert("Updated", "Your note has been updated.");
      } else {
        const result = await api.createNote(selectedLecture.id, noteData);
        const savedNote = result?.note || result;

        if (savedNote?.id) {
          setNotes((previous) => [savedNote, ...previous]);
        } else {
          const refreshed = await api.listNotes(selectedLecture.id);
          setNotes(getItems(refreshed, "notes"));
        }

        Alert.alert("Saved", "Your note has been saved.");
      }

      setTitle("");
      setContent("");
      setEditingNoteId(null);
    } catch (err) {
      Alert.alert(
        editingNoteId !== null ? "Could not update note" : "Could not save note",
        err.message || "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function editNote(note) {
    setEditingNoteId(note.id);
    setTitle(note.title || "");
    setContent(note.content || "");
  }

  function cancelEdit() {
    setEditingNoteId(null);
    setTitle("");
    setContent("");
  }


  function confirmDelete(note) {
    Alert.alert("Delete note?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteNote(note.id);
            setNotes((previous) =>
              previous.filter((item) => item.id !== note.id)
            );
          } catch (err) {
            Alert.alert("Could not delete note", err.message);
          }
        },
      },
    ]);
  }

  return (
    <View style={{ marginBottom: 170 }}>
      <Text
        style={{
          fontSize: 21,
          fontWeight: "800",
          color: NAVY,
          marginBottom: 14,
        }}
      >
        My Modules
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={NAVY} />
      ) : error && modules.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity onPress={loadModules} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : modules.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No modules yet</Text>
          <Text style={styles.emptyText}>
            Create a module first, then add a lecture to it.
          </Text>
        </View>
      ) : (
        modules.map((module) => {
          const isExpanded = expandedModule === module.id;
          const moduleLectures = lecturesByModule[module.id] || [];

          return (
            <View key={module.id} style={styles.card}>
              <TouchableOpacity
                onPress={() => toggleModule(module)}
                style={styles.moduleButton}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleTitle}>{module.name}</Text>
                  {!!module.code && (
                    <Text style={styles.muted}>{module.code}</Text>
                  )}
                  <Text style={styles.muted}>
                    {isExpanded ? "Tap to collapse" : "Tap to view lectures"}
                  </Text>
                </View>
                <Text style={styles.chevron}>{isExpanded ? "−" : "+"}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.inner}>
                  {lecturesLoading ? (
                    <ActivityIndicator color={NAVY} />
                  ) : moduleLectures.length === 0 ? (
                    <Text style={styles.emptyText}>
                      No lectures in this module yet. Add one from Manage
                      Modules & Lectures on the Home screen.
                    </Text>
                  ) : (
                    moduleLectures.map((lecture) => (
                      <TouchableOpacity
                        key={lecture.id}
                        onPress={() => openLecture(lecture)}
                        style={[
                          styles.lectureButton,
                          selectedLecture?.id === lecture.id &&
                            styles.selectedLecture,
                        ]}
                      >
                        <Text style={styles.lectureTitle}>
                          {lecture.title || "Untitled lecture"}
                        </Text>
                        <Text style={styles.muted}>
                          {selectedLecture?.id === lecture.id
                            ? "Selected"
                            : "View notes"}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>
          );
        })
      )}

      {error !== "" && modules.length > 0 && (
        <Text style={styles.error}>{error}</Text>
      )}

      {selectedLecture && (
        <View style={styles.notesPanel}>
          <Text style={styles.panelTitle}>Notes</Text>
          <Text style={styles.muted}>{selectedLecture.title}</Text>

          <Text style={styles.panelTitle}>Recordings & transcripts</Text>
          <TextInput
            style={styles.input}
            placeholder="Search saved transcripts..."
            placeholderTextColor="#777777"
            value={transcriptSearch}
            onChangeText={setTranscriptSearch}
            onSubmitEditing={handleTranscriptSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search saved lecture transcripts"
          />

          <TouchableOpacity
            style={styles.transcriptButton}
            onPress={handleTranscriptSearch}
            disabled={searchLoading || recordingsLoading}
          >
            {searchLoading ? (
              <ActivityIndicator color={NAVY} />
            ) : (
              <Text style={styles.transcriptButtonText}>
                Search transcripts
              </Text>
            )}
          </TouchableOpacity>

            {searchLoading && (
              <Text style={styles.muted}>
                Searching saved transcripts...
              </Text>
            )}

            {!!searchError && (
              <Text style={styles.error}>
                {searchError}
              </Text>
            )}

            {searchSubmitted !== "" && searchResults.length > 0 && (
              <View style={styles.transcriptContent}>
                <Text style={styles.recordingTitle}>
                  {searchResults.length} matching segment
                  {searchResults.length === 1 ? "" : "s"}
                </Text>

                {searchResults.map((result) => (
                  <View key={result.key} style={styles.transcriptSegment}>
                    <Text style={styles.recordingTitle}>
                      {result.recordingTitle}
                    </Text>

                    {result.start !== undefined && (
                      <Text style={styles.timestamp}>
                        {formatTimestamp(result.start)}
                        {result.end !== undefined &&
                          ` – ${formatTimestamp(result.end)}`}
                      </Text>
                    )}

                    <Text style={styles.transcriptText}>
                      {result.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

          {recordingsLoading ? (
            <ActivityIndicator color={NAVY} />
          ) : recordingsError ? (
            <Text style={styles.error}>{recordingsError}</Text>
          ) : recordings.length === 0 ? (
            <Text style={styles.emptyText}>
              No recordings found for this lecture yet.
            </Text>
          ) : (
            recordings.map((recording) => {
              const isTranscriptOpen =
                expandedTranscriptId === recording.id;
              const savedTranscript =
                transcriptsByRecording[recording.id];
              const transcriptError =
                transcriptErrors[recording.id];
              const segments = Array.isArray(savedTranscript?.segments)
                ? savedTranscript.segments
                : [];
              const searchTerm = transcriptSearch.trim().toLowerCase();
              const filteredSegments = segments.filter((segment) =>
                String(segment.text || "")
                  .toLowerCase()
                  .includes(searchTerm)
              );
              return (
                <View key={recording.id} style={styles.recordingCard}>
                  <Text style={styles.recordingTitle}>
                    {recording.title ||
                      recording.original_filename ||
                      "Lecture recording"}
                  </Text>

                  <Text style={styles.muted}>
                    {recording.created_at
                      ? new Date(recording.created_at).toLocaleDateString()
                      : "Date unavailable"}
                  </Text>

                  <TouchableOpacity
                    onPress={() => toggleTranscript(recording)}
                    disabled={transcriptLoadingId === recording.id}
                    style={[
                      styles.transcriptButton,
                      transcriptLoadingId === recording.id && {
                        opacity: 0.6,
                      },
                    ]}
                  >
                    {transcriptLoadingId === recording.id ? (
                      <ActivityIndicator color={NAVY} />
                    ) : (
                      <Text style={styles.transcriptButtonText}>
                        {isTranscriptOpen
                          ? "Hide transcript"
                          : "View saved transcript"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {!!transcriptError && (
                    <Text style={styles.error}>
                      {transcriptError.includes("Transcript not found")
                        ? "No saved transcript yet. Transcribe this recording from the Recordings screen first."
                        : transcriptError}
                    </Text>
                  )}

                  {isTranscriptOpen && savedTranscript && (
                    <View style={styles.transcriptContent}>
                      {!!savedTranscript.language && (
                        <Text style={styles.muted}>
                          Language: {savedTranscript.language}
                        </Text>
                      )}

                      {segments.length > 0 ? (
                        filteredSegments.length > 0 ? (
                          filteredSegments.map((segment, index) => (
                            <View
                              key={`${recording.id}-segment-${index}`}
                              style={styles.transcriptSegment}
                            >
                              <Text style={styles.timestamp}>
                                {formatTimestamp(segment.start)} – {formatTimestamp(segment.end)}
                              </Text>

                              <Text style={styles.transcriptText}>
                                {segment.text || ""}
                              </Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.emptyText}>
                            No matching transcript segments found.
                          </Text>
                        )
                      ) : (
                        <Text style={styles.transcriptText}>
                          {savedTranscript.transcript || "This transcript has no text."}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}

          <Text style={styles.label}>Note title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Key concepts"
            style={styles.input}
          />

          <Text style={styles.label}>Note content</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write your lecture notes here..."
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.textArea]}
          />

          <TouchableOpacity
            onPress={saveNote}
            disabled={saving}
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
          >
                        <Text style={styles.saveButtonText}>
              {saving
                ? editingNoteId !== null
                  ? "Updating..."
                  : "Saving..."
                : editingNoteId !== null
                  ? "Update Note"
                  : "Save Note"}
            </Text>
          </TouchableOpacity>

                    {editingNoteId !== null && (
            <TouchableOpacity
              onPress={cancelEdit}
              disabled={saving}
              style={{
                padding: 12,
                alignItems: "center",
                marginTop: -12,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: NAVY, fontWeight: "600" }}>
                Cancel Editing
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.panelTitle}>Saved notes ({notes.length})</Text>

          {notesLoading ? (
            <ActivityIndicator color={NAVY} />
          ) : notes.length === 0 ? (
            <Text style={styles.emptyText}>No notes saved for this lecture.</Text>
          ) : (
            notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noteTitle}>
                    {note.title || "Untitled note"}
                  </Text>
                  <Text style={styles.noteContent}>
                    {note.content || "No content"}
                  </Text>
                </View>
                                <View style={{ alignItems: "flex-end", gap: 12 }}>
                  <TouchableOpacity onPress={() => editNote(note)}>
                    <Text style={{ color: NAVY, fontWeight: "700", fontSize: 12 }}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => confirmDelete(note)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = {
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5EAF0",
    overflow: "hidden",
  },
  moduleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  moduleTitle: { color: NAVY, fontSize: 16, fontWeight: "700" },
  muted: { color: MUTED, fontSize: 12, marginTop: 5 },
  chevron: { color: NAVY, fontSize: 25, fontWeight: "600", paddingLeft: 12 },
  inner: { paddingHorizontal: 12, paddingBottom: 12 },
  lectureButton: {
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    padding: 12,
    marginTop: 7,
    borderWidth: 1,
    borderColor: "#E5EAF0",
  },
  selectedLecture: {
    borderColor: GOLD,
    backgroundColor: "#FFF9E9",
  },
  lectureTitle: { color: "#101828", fontSize: 14, fontWeight: "600" },
  empty: {
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: { color: NAVY, fontSize: 16, fontWeight: "700" },
  emptyText: { color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 6 },
  error: { color: "#B42318", marginVertical: 10 },
  retryButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: NAVY,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: { color: NAVY, fontWeight: "600" },
  notesPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5EAF0",
  },
  panelTitle: {
    color: NAVY,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 8,
  },
  label: {
    color: "#344054",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    padding: 11,
    color: "#101828",
    fontSize: 14,
  },
  textArea: { minHeight: 110 },
  saveButton: {
    backgroundColor: NAVY,
    padding: 13,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 18,
  },
  saveButtonText: { color: "#FFFFFF", fontWeight: "700" },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    marginTop: 8,
  },
  noteTitle: { color: NAVY, fontSize: 14, fontWeight: "700" },
  noteContent: {
    color: "#344054",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  deleteText: { color: "#B42318", fontWeight: "600", fontSize: 12 },
  recordingCard: {
    backgroundColor: "#F5F7FA",
    borderRadius: 9,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5EAF0",
  },
  recordingTitle: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  transcriptButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF9E9",
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 10,
  },
  transcriptButtonText: {
    color: NAVY,
    fontSize: 13,
    fontWeight: "700",
  },
  transcriptContent: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5EAF0",
  },
  transcriptSegment: {
    marginBottom: 12,
  },
  timestamp: {
    color: NAVY,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  transcriptText: {
    color: "#344054",
    fontSize: 14,
    lineHeight: 22,
  },

};
