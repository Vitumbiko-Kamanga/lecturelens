import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Linking,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { api } from "../../services/api";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const MUTED = "#667085";

const RESOURCE_TYPES = [
  "book",
  "article",
  "website",
  "paper",
  "video",
  "other",
];

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function getItems(result, key) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.[key])) return result[key];
  return [];
}

/**
 * Normalize transcripts from Deepgram and Whisper.
 *
 * Deepgram returns word-level segments containing "word".
 * Whisper returns segments containing "text".
 *
 * For Deepgram, use the complete transcript and hide the word-level
 * timestamps so the Notes screen displays readable continuous text.
 */
function normalizeTranscript(transcriptRecord) {
  if (!transcriptRecord || typeof transcriptRecord !== "object") {
    return transcriptRecord;
  }

  const segments = Array.isArray(transcriptRecord.segments)
    ? transcriptRecord.segments
    : [];

  const hasDeepgramWordSegments = segments.some(
    (segment) =>
      typeof segment?.word === "string" &&
      typeof segment?.text !== "string"
  );

  if (hasDeepgramWordSegments) {
    const reconstructedText = segments
      .map((segment) => segment.word || "")
      .filter(Boolean)
      .join(" ");

    return {
      ...transcriptRecord,
      transcript:
        transcriptRecord.transcript ||
        reconstructedText ||
        "",
      segments: [],
    };
  }

  return transcriptRecord;
}

export default function ModulesSection({
  initialModuleId,
  initialLectureId,
  onSelectedLectureChange,
}) {
  const [modules, setModules] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [lecturesByModule, setLecturesByModule] = useState({});
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [notes, setNotes] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [recordingsLoading, setRecordingsLoading] = useState(false);
  const [recordingsError, setRecordingsError] = useState("");

  // Module resources
  const [resourcesByModule, setResourcesByModule] = useState({});
  const [resourcesLoading, setResourcesLoading] = useState({});
  const [resourcesError, setResourcesError] = useState({});
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceAuthor, setResourceAuthor] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceType, setResourceType] = useState("book");
  const [resourceSaving, setResourceSaving] = useState(false);
  const [resourceFormModuleId, setResourceFormModuleId] = useState(null);

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
  const [noteFormOpen, setNoteFormOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [lecturesLoading, setLecturesLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handledSelectionRef = useRef(null);

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

  const loadModuleResources = useCallback(async (moduleId) => {
    setResourcesLoading((previous) => ({
      ...previous,
      [moduleId]: true,
    }));

    setResourcesError((previous) => ({
      ...previous,
      [moduleId]: "",
    }));

    try {
      const result = await api.listResources(moduleId);

      setResourcesByModule((previous) => ({
        ...previous,
        [moduleId]: getItems(result, "resources"),
      }));
    } catch (err) {
      setResourcesError((previous) => ({
        ...previous,
        [moduleId]: err.message || "Could not load learning resources.",
      }));
    } finally {
      setResourcesLoading((previous) => ({
        ...previous,
        [moduleId]: false,
      }));
    }
  }, []);

  const openLecture = useCallback(
    async (lecture, moduleName) => {
      LayoutAnimation.configureNext(
        LayoutAnimation.Presets.easeInEaseOut
      );

      setSelectedLecture(lecture);

      // A new lecture starts with a closed, empty note editor.
      setNoteFormOpen(false);
      setTitle("");
      setContent("");
      setEditingNoteId(null);

      onSelectedLectureChange?.({
        moduleName: moduleName || "Unknown module",
        lectureTitle: lecture.title || "Untitled lecture",
      });

      setNotes([]);
      setRecordings([]);
      setTranscriptsByRecording({});
      setExpandedTranscriptId(null);
      setTranscriptErrors({});
      setTranscriptSearch("");
      setNotesLoading(true);
      setRecordingsLoading(true);
      setError("");
      setRecordingsError("");
      setSearchSubmitted("");
      setSearchResults([]);
      setSearchError("");

      try {
        const result = await api.listNotes(lecture.id);
        setNotes(getItems(result, "notes"));
      } catch (err) {
        setError(err.message || "Could not load notes.");
      } finally {
        setNotesLoading(false);
      }

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
    },
    [onSelectedLectureChange]
  );

  // Automatically open a lecture requested by the Home screen.
  useEffect(() => {
    if (
      initialModuleId == null ||
      initialLectureId == null ||
      modules.length === 0
    ) {
      return;
    }

    const selectionKey = `${initialModuleId}:${initialLectureId}`;

    if (handledSelectionRef.current === selectionKey) {
      return;
    }

    let active = true;

    async function selectRequestedLecture() {
      const targetModule = modules.find(
        (module) => String(module.id) === String(initialModuleId)
      );

      if (!targetModule) {
        setError("The selected module could not be found.");
        return;
      }

      try {
        setError("");
        setExpandedModule(targetModule.id);
        setLecturesLoading(true);

        const [lectureResult] = await Promise.all([
          api.listLectures(targetModule.id),
          loadModuleResources(targetModule.id),
        ]);

        const moduleLectures = getItems(lectureResult, "lectures");

        if (!active) return;

        setLecturesByModule((previous) => ({
          ...previous,
          [targetModule.id]: moduleLectures,
        }));

        const targetLecture = moduleLectures.find(
          (lecture) => String(lecture.id) === String(initialLectureId)
        );

        if (!targetLecture) {
          setError("The selected lecture could not be found in this module.");
          return;
        }

        handledSelectionRef.current = selectionKey;

        await openLecture(targetLecture, targetModule.name);
      } catch (err) {
        if (active) {
          setError(err.message || "Could not open the selected lecture.");
        }
      } finally {
        if (active) {
          setLecturesLoading(false);
        }
      }
    }

    selectRequestedLecture();

    return () => {
      active = false;
    };
  }, [
    modules,
    initialModuleId,
    initialLectureId,
    openLecture,
    loadModuleResources,
  ]);

  async function toggleModule(module) {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    );

    if (expandedModule === module.id) {
      setExpandedModule(null);
      setSelectedLecture(null);
      setNotes([]);
      setRecordings([]);
      setNoteFormOpen(false);
      setTitle("");
      setContent("");
      setEditingNoteId(null);

      onSelectedLectureChange?.(null);
      return;
    }

    setExpandedModule(module.id);
    setSelectedLecture(null);
    setNotes([]);
    setRecordings([]);
    setNoteFormOpen(false);
    setTitle("");
    setContent("");
    setEditingNoteId(null);

    onSelectedLectureChange?.(null);

    setLecturesLoading(true);
    setError("");

    try {
      const [lectureResult] = await Promise.all([
        api.listLectures(module.id),
        loadModuleResources(module.id),
      ]);

      setLecturesByModule((previous) => ({
        ...previous,
        [module.id]: getItems(lectureResult, "lectures"),
      }));
    } catch (err) {
      setError(err.message || "Could not load lectures.");
    } finally {
      setLecturesLoading(false);
    }
  }

  function resetResourceForm() {
    setResourceTitle("");
    setResourceAuthor("");
    setResourceUrl("");
    setResourceType("book");
  }

  function toggleResourceForm(moduleId) {
    if (String(resourceFormModuleId) === String(moduleId)) {
      setResourceFormModuleId(null);
      resetResourceForm();
      return;
    }

    setResourceFormModuleId(moduleId);
    resetResourceForm();
  }

  function cancelResourceForm() {
    setResourceFormModuleId(null);
    resetResourceForm();
  }

  async function saveResource(moduleId) {
    if (!resourceTitle.trim()) {
      Alert.alert("Resource title required", "Enter the resource title.");
      return;
    }

    const cleanUrl = resourceUrl.trim();

    if (cleanUrl && !/^https?:\/\/\S+$/i.test(cleanUrl)) {
      Alert.alert(
        "Invalid URL",
        "Enter a valid link beginning with https:// or http://."
      );
      return;
    }

    setResourceSaving(true);

    try {
      const resourceData = {
        title: resourceTitle.trim(),
        author: resourceAuthor.trim(),
        url: cleanUrl,
        resource_type: resourceType,
      };

      const result = await api.createResource(moduleId, resourceData);
      const savedResource = result?.resource || result;

      if (savedResource?.id) {
        setResourcesByModule((previous) => ({
          ...previous,
          [moduleId]: [
            savedResource,
            ...(previous[moduleId] || []),
          ],
        }));
      } else {
        await loadModuleResources(moduleId);
      }

      resetResourceForm();
      setResourceFormModuleId(null);

      Alert.alert("Resource saved", "Your learning resource has been saved.");
    } catch (err) {
      Alert.alert(
        "Could not save resource",
        err.message || "Please try again."
      );
    } finally {
      setResourceSaving(false);
    }
  }

  async function openResource(resource) {
    if (!resource.url) {
      Alert.alert(
        "No link available",
        "This resource does not have a URL saved."
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(resource.url);

      if (!supported) {
        Alert.alert("Cannot open link", "This URL cannot be opened.");
        return;
      }

      await Linking.openURL(resource.url);
    } catch (err) {
      Alert.alert(
        "Could not open resource",
        err.message || "Please check the saved URL."
      );
    }
  }

  function confirmDeleteResource(moduleId, resource) {
    Alert.alert(
      "Delete resource?",
      `Are you sure you want to delete "${resource.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteResource(resource.id);

              setResourcesByModule((previous) => ({
                ...previous,
                [moduleId]: (previous[moduleId] || []).filter(
                  (item) => String(item.id) !== String(resource.id)
                ),
              }));
            } catch (err) {
              Alert.alert(
                "Could not delete resource",
                err.message || "Please try again."
              );
            }
          },
        },
      ]
    );
  }

  async function toggleTranscript(recording) {
    const recordingId = recording.id;

    if (expandedTranscriptId === recordingId) {
      setExpandedTranscriptId(null);
      return;
    }

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

      // Normalize Deepgram word-level segments into full readable text.
      const savedTranscript = normalizeTranscript(result?.transcript);

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

          // Apply the same normalization used when viewing a transcript.
          const transcript = normalizeTranscript(response?.transcript);

          if (!transcript) continue;

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
        } catch (err) {
          console.log(
            `Could not search transcript for recording ${recording.id}:`,
            err.message
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
    } catch (err) {
      setSearchError(
        err.message || "Unable to search saved transcripts."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  function formatTimestamp(seconds) {
    const totalSeconds = Math.max(
      0,
      Math.floor(Number(seconds) || 0)
    );
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  async function saveNote() {
    if (!selectedLecture) {
      Alert.alert(
        "Select a lecture",
        "Choose a lecture before saving a note."
      );
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
            String(note.id) === String(updatedNote.id)
              ? updatedNote
              : note
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

      LayoutAnimation.configureNext(
        LayoutAnimation.Presets.easeInEaseOut
      );

      setTitle("");
      setContent("");
      setEditingNoteId(null);
      setNoteFormOpen(false);
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
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    );

    setEditingNoteId(note.id);
    setTitle(note.title || "");
    setContent(note.content || "");
    setNoteFormOpen(true);
  }

  function cancelEdit() {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    );

    setEditingNoteId(null);
    setTitle("");
    setContent("");
    setNoteFormOpen(false);
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
              previous.filter(
                (item) => String(item.id) !== String(note.id)
              )
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
          fontSize: 18,
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
          const moduleResources = resourcesByModule[module.id] || [];
          const isResourceFormOpen =
            String(resourceFormModuleId) === String(module.id);

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
                    {isExpanded
                      ? "Tap to collapse"
                      : "Tap to view lectures and resources"}
                  </Text>
                </View>

                <Text style={styles.chevron}>
                  {isExpanded ? "−" : "+"}
                </Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.inner}>
                  <Text style={styles.sectionTitle}>Lectures</Text>

                  {lecturesLoading ? (
                    <ActivityIndicator color={NAVY} />
                  ) : moduleLectures.length === 0 ? (
                    <Text style={styles.emptyText}>
                      No lectures in this module yet. Add one from Manage
                      Modules & Lectures on the Home screen.
                    </Text>
                  ) : (
                    moduleLectures.map((lecture) => {
                      const isLectureSelected =
                        String(selectedLecture?.id) === String(lecture.id);

                      return (
                        <TouchableOpacity
                          key={lecture.id}
                          onPress={() => openLecture(lecture, module.name)}
                          style={[
                            styles.lectureButton,
                            isLectureSelected && styles.selectedLecture,
                          ]}
                        >
                          <Text style={styles.lectureTitle}>
                            {lecture.title || "Untitled lecture"}
                          </Text>

                          <Text style={styles.muted}>
                            {isLectureSelected
                              ? "✓ Selected — view lecture details below"
                              : "Tap to view notes"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}

                  {/* Learning resources for this module */}
                  <View style={styles.resourceSection}>
                    <Text style={styles.sectionTitle}>Learning Resources</Text>

                    <Text style={styles.emptyText}>
                      Save books, articles, websites and other study materials
                      for this module.
                    </Text>

                    {resourcesLoading[module.id] ? (
                      <ActivityIndicator
                        color={NAVY}
                        style={{ marginVertical: 12 }}
                      />
                    ) : resourcesError[module.id] ? (
                      <View>
                        <Text style={styles.error}>
                          {resourcesError[module.id]}
                        </Text>

                        <TouchableOpacity
                          onPress={() => loadModuleResources(module.id)}
                          style={styles.retryButton}
                        >
                          <Text style={styles.retryText}>
                            Retry loading resources
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : moduleResources.length === 0 ? (
                      <Text style={styles.emptyText}>
                        No learning resources saved for this module yet.
                      </Text>
                    ) : (
                      moduleResources.map((resource) => (
                        <View key={resource.id} style={styles.resourceCard}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.resourceTitle}>
                              {resource.title}
                            </Text>

                            {!!resource.author && (
                              <Text style={styles.muted}>
                                Author: {resource.author}
                              </Text>
                            )}

                            <Text style={styles.resourceType}>
                              {(resource.resource_type || "other").toUpperCase()}
                            </Text>

                            {!!resource.url && (
                              <TouchableOpacity
                                onPress={() => openResource(resource)}
                                style={styles.openResourceButton}
                              >
                                <Text style={styles.openResourceText}>
                                  Open resource
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>

                          <TouchableOpacity
                            onPress={() =>
                              confirmDeleteResource(module.id, resource)
                            }
                            style={styles.resourceDeleteButton}
                          >
                            <Text style={styles.deleteText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    )}

                    <TouchableOpacity
                      onPress={() => toggleResourceForm(module.id)}
                      style={styles.addResourceButton}
                      disabled={resourceSaving}
                    >
                      <Text style={styles.addResourceButtonText}>
                        {isResourceFormOpen
                          ? "− Hide Learning Resources Form"
                          : "+ Add Learning Resources"}
                      </Text>
                    </TouchableOpacity>

                    {isResourceFormOpen && (
                      <View style={styles.resourceForm}>
                        <Text style={styles.resourceFormTitle}>
                          Add a learning resource
                        </Text>

                        <Text style={styles.label}>Resource title *</Text>
                        <TextInput
                          value={resourceTitle}
                          onChangeText={setResourceTitle}
                          placeholder="e.g. Introduction to Database Systems"
                          style={styles.input}
                        />

                        <Text style={styles.label}>Author (optional)</Text>
                        <TextInput
                          value={resourceAuthor}
                          onChangeText={setResourceAuthor}
                          placeholder="Enter author or publisher"
                          style={styles.input}
                        />

                        <Text style={styles.label}>Resource URL (optional)</Text>
                        <TextInput
                          value={resourceUrl}
                          onChangeText={setResourceUrl}
                          placeholder="https://example.com"
                          autoCapitalize="none"
                          keyboardType="url"
                          style={styles.input}
                        />

                        <Text style={styles.label}>Resource type</Text>
                        <View style={styles.resourceTypes}>
                          {RESOURCE_TYPES.map((type) => (
                            <TouchableOpacity
                              key={type}
                              onPress={() => setResourceType(type)}
                              style={[
                                styles.resourceTypeOption,
                                resourceType === type &&
                                  styles.resourceTypeSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.resourceTypeOptionText,
                                  resourceType === type &&
                                    styles.resourceTypeSelectedText,
                                ]}
                              >
                                {type === "paper"
                                  ? "Research paper"
                                  : type.charAt(0).toUpperCase() + type.slice(1)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <TouchableOpacity
                          onPress={() => saveResource(module.id)}
                          disabled={resourceSaving}
                          style={[
                            styles.resourceSaveButton,
                            resourceSaving && { opacity: 0.6 },
                          ]}
                        >
                          {resourceSaving ? (
                            <ActivityIndicator color="#FFFFFF" />
                          ) : (
                            <Text style={styles.resourceSaveButtonText}>
                              Save Learning Resource
                            </Text>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={cancelResourceForm}
                          disabled={resourceSaving}
                          style={styles.cancelResourceButton}
                        >
                          <Text style={styles.cancelResourceButtonText}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
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
          <Text style={styles.panelTitle}>Lecture Details & Notes</Text>
          <Text style={styles.selectedLectureTitle}>
            {selectedLecture.title || "Untitled lecture"}
          </Text>

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
            <Text style={styles.error}>{searchError}</Text>
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

                  <Text style={styles.transcriptText}>{result.text}</Text>
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
                                {formatTimestamp(segment.start)} –{" "}
                                {formatTimestamp(segment.end)}
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
                          {savedTranscript.transcript ||
                            "This transcript has no text."}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}

          {/* Add Note / Hide Note Editor */}
          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );

              if (noteFormOpen) {
                cancelEdit();
              } else {
                setTitle("");
                setContent("");
                setEditingNoteId(null);
                setNoteFormOpen(true);
              }
            }}
            disabled={saving}
            style={styles.addNoteButton}
          >
            <Text style={styles.addNoteButtonText}>
              {noteFormOpen ? "− Hide Note Editor" : "+ Add Note"}
            </Text>
          </TouchableOpacity>

          {/* Collapsible note editor */}
          {noteFormOpen && (
            <View style={styles.noteForm}>
              <Text style={styles.noteFormTitle}>
                {editingNoteId !== null
                  ? "Edit lecture note"
                  : "Create a lecture note"}
              </Text>

              <Text style={styles.label}>Note title *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Key concepts"
                style={styles.input}
              />

              <Text style={styles.label}>Note content *</Text>
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
                style={[
                  styles.saveButton,
                  saving && { opacity: 0.6 },
                ]}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingNoteId !== null ? "Update Note" : "Save Note"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={cancelEdit}
                disabled={saving}
                style={styles.cancelNoteButton}
              >
                <Text style={styles.cancelNoteButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.panelTitle}>Saved notes ({notes.length})</Text>

          {notesLoading ? (
            <ActivityIndicator color={NAVY} />
          ) : notes.length === 0 ? (
            <Text style={styles.emptyText}>
              No notes saved for this lecture.
            </Text>
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
                    <Text
                      style={{
                        color: NAVY,
                        fontWeight: "700",
                        fontSize: 12,
                      }}
                    >
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
  moduleTitle: {
    color: NAVY,
    fontSize: 16,
    fontWeight: "700",
  },
  muted: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
  },
  chevron: {
    color: NAVY,
    fontSize: 25,
    fontWeight: "600",
    paddingLeft: 12,
  },
  inner: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  sectionTitle: {
    color: NAVY,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 6,
  },
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
    borderWidth: 2,
  },
  lectureTitle: {
    color: "#101828",
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    color: NAVY,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  error: {
    color: "#B42318",
    marginVertical: 10,
  },
  retryButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: NAVY,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  retryText: {
    color: NAVY,
    fontWeight: "600",
  },
  resourceSection: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5EAF0",
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    marginTop: 9,
    borderWidth: 1,
    borderColor: "#E5EAF0",
  },
  resourceTitle: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  resourceType: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 7,
  },
  openResourceButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF9E9",
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 8,
  },
  openResourceText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "700",
  },
  resourceDeleteButton: {
    padding: 5,
  },
  resourceTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  resourceTypeOption: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },
  resourceTypeSelected: {
    backgroundColor: "#FFF9E9",
    borderColor: GOLD,
  },
  resourceTypeOptionText: {
    color: "#344054",
    fontSize: 12,
  },
  resourceTypeSelectedText: {
    color: NAVY,
    fontWeight: "700",
  },
  addResourceButton: {
    backgroundColor: "#FFF4D6",
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 9,
    padding: 13,
    alignItems: "center",
    marginTop: 14,
  },
  addResourceButtonText: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  resourceForm: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5EAF0",
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
  },
  resourceFormTitle: {
    color: NAVY,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  cancelResourceButton: {
    alignItems: "center",
    padding: 11,
    marginTop: 5,
  },
  cancelResourceButtonText: {
    color: MUTED,
    fontWeight: "600",
  },
  resourceSaveButton: {
    backgroundColor: NAVY,
    borderRadius: 8,
    padding: 13,
    alignItems: "center",
    marginTop: 14,
  },
  resourceSaveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
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
  selectedLectureTitle: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FFF9E9",
    borderWidth: 1,
    borderColor: GOLD,
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
  textArea: {
    minHeight: 110,
  },
  addNoteButton: {
    backgroundColor: "#FFF4D6",
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 9,
    padding: 13,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 12,
  },
  addNoteButtonText: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  noteForm: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5EAF0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },
  noteFormTitle: {
    color: NAVY,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: NAVY,
    padding: 13,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  cancelNoteButton: {
    alignItems: "center",
    padding: 12,
    marginTop: 2,
  },
  cancelNoteButtonText: {
    color: MUTED,
    fontWeight: "600",
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    marginTop: 8,
  },
  noteTitle: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "700",
  },
  noteContent: {
    color: "#344054",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  deleteText: {
    color: "#B42318",
    fontWeight: "600",
    fontSize: 12,
  },
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