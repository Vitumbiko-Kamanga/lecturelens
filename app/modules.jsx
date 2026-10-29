
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { api } from "../services/api";
import LectureRecordings from "../components/recordings/LectureRecordings";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const MUTED = "#667085";

export default function ModulesScreen() {
  const router = useRouter();
  const routeParams = useLocalSearchParams();
  const selectedModuleId = Array.isArray(routeParams.moduleId)
    ? routeParams.moduleId[0]
    : routeParams.moduleId;
  const selectedLectureId = Array.isArray(routeParams.lectureId)
    ? routeParams.lectureId[0]
    : routeParams.lectureId;
  const scrollViewRef = useRef(null);
  const hasScrolledToSelection = useRef(false);

  useEffect(() => {
    hasScrolledToSelection.current = false;
  }, [selectedModuleId, selectedLectureId]);

  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState({});
  const [moduleName, setModuleName] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [description, setDescription] = useState("");
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingModuleName, setEditingModuleName] = useState("");
  const [editingModuleCode, setEditingModuleCode] = useState("");
  const [editingModuleDescription, setEditingModuleDescription] = useState("");
  const [lectureTitles, setLectureTitles] = useState({});
  const [lectureTopics, setLectureTopics] = useState({});
  const [editingLectureId, setEditingLectureId] = useState(null);
  const [editingLectureTitle, setEditingLectureTitle] = useState("");
  const [editingLectureTopic, setEditingLectureTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadModules = useCallback(async () => {
    try {
      setError("");
      const result = await api.listModules();
      const items = Array.isArray(result) ? result : result?.modules || [];
      setModules(items);

      const lectureResults = await Promise.all(
        items.map(async (module) => {
          try {
            const result = await api.listLectures(module.id);
            return [
              module.id,
              {
                items: Array.isArray(result)
                  ? result
                  : result?.lectures || [],
                error: "",
              },
            ];
          } catch (err) {
            return [
              module.id,
              {
                items: [],
                error: err.message || "Could not load lectures.",
              },
            ];
          }
        })
      );

      setLectures(Object.fromEntries(lectureResults));


    } catch (err) {
      setError(err.message || "Could not load your modules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadModules();
    }, [loadModules])
  );

  async function handleCreateModule() {
    if (!moduleName.trim()) {
      Alert.alert("Module name required", "Enter the name of your module.");
      return;
    }

    try {
      setSaving(true);
      await api.createModule({
        name: moduleName.trim(),
        code: moduleCode.trim(),
        description: description.trim(),
      });

      setModuleName("");
      setModuleCode("");
      setDescription("");
      await loadModules();
      Alert.alert("Success", "Your module has been created.");
    } catch (err) {
      Alert.alert("Could not create module", err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditingModule(module) {
    setEditingModuleId(module.id);
    setEditingModuleName(module.name || "");
    setEditingModuleCode(module.code || "");
    setEditingModuleDescription(module.description || "");
  }

  function cancelEditingModule() {
    setEditingModuleId(null);
    setEditingModuleName("");
    setEditingModuleCode("");
    setEditingModuleDescription("");
  }

  async function handleUpdateModule(module) {
    const name = editingModuleName.trim();

    if (!name) {
      Alert.alert("Module name required", "Enter a name for the module.");
      return;
    }

    try {
      setSaving(true);

      await api.updateModule(module.id, {
        name,
        code: editingModuleCode.trim(),
        description: editingModuleDescription.trim(),
      });

      cancelEditingModule();
      await loadModules();

      Alert.alert("Success", "Your module has been updated.");
    } catch (err) {
      Alert.alert(
        "Could not update module",
        err.message || "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }


  async function handleCreateLecture(module) {
    const title = (lectureTitles[module.id] || "").trim();
    const topic = (lectureTopics[module.id] || "").trim();

    if (!title) {
      Alert.alert("Lecture title required", "Enter a title for the lecture.");
      return;
    }

    try {
      setSaving(true);
      await api.createLecture(module.id, {
        title,
        topic,
        lecture_date: new Date().toISOString().slice(0, 10),
      });

      setLectureTitles((previous) => ({
        ...previous,
        [module.id]: "",
      }));
      setLectureTopics((previous) => ({
        ...previous,
        [module.id]: "",
      }));

      await loadModules();
      Alert.alert("Success", "Your lecture has been saved.");
    } catch (err) {
      Alert.alert("Could not create lecture", err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditingLecture(lecture) {
  setEditingLectureId(lecture.id);
  setEditingLectureTitle(lecture.title || "");
  setEditingLectureTopic(lecture.topic || "");
}

function cancelEditingLecture() {
  setEditingLectureId(null);
  setEditingLectureTitle("");
  setEditingLectureTopic("");
}

async function handleUpdateLecture(lecture) {
  const title = editingLectureTitle.trim();
  const topic = editingLectureTopic.trim();

  if (!title) {
    Alert.alert("Lecture title required", "Enter a title for the lecture.");
    return;
  }

  try {
    setSaving(true);

    await api.updateLecture(lecture.id, {
      title,
      topic,
    });

    cancelEditingLecture();
    await loadModules();

    Alert.alert("Success", "Your lecture has been updated.");
  } catch (err) {
    Alert.alert(
      "Could not update lecture",
      err.message || "Please try again."
    );
  } finally {
    setSaving(false);
  }
}

async function handleDeleteLecture(lecture) {
  try {
    setSaving(true);

    await api.deleteLecture(lecture.id);

    if (editingLectureId === lecture.id) {
      cancelEditingLecture();
    }

    await loadModules();

    Alert.alert("Success", "The lecture has been deleted.");
  } catch (err) {
    Alert.alert(
      "Could not delete lecture",
      err.message || "Please try again."
    );
  } finally {
    setSaving(false);
  }
}

function confirmDeleteLecture(lecture) {
  Alert.alert(
    "Delete lecture?",
    `Are you sure you want to delete "${lecture.title || "Untitled lecture"}"? This action may affect associated notes and recordings.`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteLecture(lecture),
      },
    ]
  );
}
  function confirmDelete(module) {
    Alert.alert(
      "Delete module?",
      `Delete "${module.name}"? This may also affect its associated lectures.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteModule(module.id);
              await loadModules();
            } catch (err) {
              Alert.alert("Could not delete module", err.message);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>My Modules</Text>
        <Text style={styles.subtitle}>
          Organise your courses and save lectures for each module.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Create a module</Text>

        <Text style={styles.label}>Module name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Database Administration"
          value={moduleName}
          onChangeText={setModuleName}
        />

        <Text style={styles.label}>Module code (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. BIT 420"
          value={moduleCode}
          onChangeText={setModuleCode}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Brief module description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={[styles.primaryButton, saving && styles.disabled]}
          onPress={handleCreateModule}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? "Please wait..." : "+ Create Module"}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
          Your modules
        </Text>

        <TouchableOpacity
          onPress={loadModules}
          disabled={loading || saving}
          style={{
            backgroundColor: "#FFF4D6",
            borderWidth: 1,
            borderColor: GOLD,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            opacity: loading || saving ? 0.6 : 1,
          }}
        >
          <Text style={{ color: NAVY, fontWeight: "700" }}>
            Refresh
          </Text>
        </TouchableOpacity>
</View>

      {loading ? (
        <ActivityIndicator size="large" color={NAVY} />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.outlineButton} onPress={loadModules}>
            <Text style={styles.outlineText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : modules.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No modules yet</Text>
          <Text style={styles.emptyText}>
            Create your first module using the form above.
          </Text>
        </View>
      ) : modules.map((module) => (
          <View
            key={module.id}
            style={[
              styles.moduleCard,
              String(module.id) === String(selectedModuleId)
                ? styles.highlightedModuleCard
                : null,
            ]}
            onLayout={(event) => {
              const isTargetModule =
                selectedModuleId &&
                String(module.id) === String(selectedModuleId);

              if (isTargetModule && !hasScrolledToSelection.current) {
                hasScrolledToSelection.current = true;
                const y = event.nativeEvent.layout.y;
                requestAnimationFrame(() => {
                  scrollViewRef.current?.scrollTo({
                    y: Math.max(0, y - 12),
                    animated: true,
                  });
                });
              }
            }}
          >
            {editingModuleId === module.id ? (
              <View>
                <Text style={styles.label}>Edit module name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Module name"
                  value={editingModuleName}
                  onChangeText={setEditingModuleName}
                  editable={!saving}
                />

                <Text style={styles.label}>Module code (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Module code"
                  value={editingModuleCode}
                  onChangeText={setEditingModuleCode}
                  autoCapitalize="characters"
                  editable={!saving}
                />

                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Module description"
                  value={editingModuleDescription}
                  onChangeText={setEditingModuleDescription}
                  multiline
                  editable={!saving}
                />

                <View style={styles.lectureActions}>
                  <TouchableOpacity
                    style={[styles.editButton, saving && styles.disabled]}
                    onPress={() => handleUpdateModule(module)}
                    disabled={saving}
                  >
                    <Text style={styles.editButtonText}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={cancelEditingModule}
                    disabled={saving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.moduleHeader}>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleName}>{module.name}</Text>

                  {!!module.code && (
                    <Text style={styles.moduleCode}>{module.code}</Text>
                  )}

                  {!!module.description && (
                    <Text style={styles.moduleDescription}>
                      {module.description}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={styles.editLink}
                    onPress={() => startEditingModule(module)}
                    disabled={saving}
                  >
                    <Text style={styles.editLinkText}>Edit Module</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => confirmDelete(module)}
                  disabled={saving}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.label}>Add a lecture</Text>

            <TextInput
              style={styles.input}
              placeholder="Lecture title"
              value={lectureTitles[module.id] || ""}
              onChangeText={(value) =>
                setLectureTitles((previous) => ({
                  ...previous,
                  [module.id]: value,
                }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Topic (optional)"
              value={lectureTopics[module.id] || ""}
              onChangeText={(value) =>
                setLectureTopics((previous) => ({
                  ...previous,
                  [module.id]: value,
                }))
              }
            />

            <TouchableOpacity
              style={[styles.secondaryButton, saving && styles.disabled]}
              onPress={() => handleCreateLecture(module)}
              disabled={saving}
            >
              <Text style={styles.secondaryButtonText}>+ Save Lecture</Text>
            </TouchableOpacity>

            <Text style={styles.lectureCount}>
              {(lectures[module.id]?.items || []).length} saved lecture(s)
            </Text>

            {!!lectures[module.id]?.error && (
              <Text style={styles.error}>
                Could not load this module's lectures: {lectures[module.id].error}
              </Text>
            )}

            {(lectures[module.id]?.items || []).map((lecture) => {
              const isEditing = editingLectureId === lecture.id;

              return (
                <View
                  key={lecture.id}
                  style={[
                    styles.lectureRow,
                    String(lecture.id) === String(selectedLectureId)
                      ? styles.highlightedLectureRow
                      : null,
                  ]}
                >
                  {isEditing ? (
                    <>
                      <Text style={styles.label}>Edit lecture title *</Text>

                      <TextInput
                        style={styles.input}
                        placeholder="Lecture title"
                        value={editingLectureTitle}
                        onChangeText={setEditingLectureTitle}
                        editable={!saving}
                      />

                      <Text style={styles.label}>Edit topic (optional)</Text>

                      <TextInput
                        style={styles.input}
                        placeholder="Lecture topic"
                        value={editingLectureTopic}
                        onChangeText={setEditingLectureTopic}
                        editable={!saving}
                      />

                      <View style={styles.lectureActions}>
                        <TouchableOpacity
                          style={[styles.editButton, saving && styles.disabled]}
                          onPress={() => handleUpdateLecture(lecture)}
                          disabled={saving}
                        >
                          <Text style={styles.editButtonText}>
                            {saving ? "Saving..." : "Save Changes"}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={cancelEditingLecture}
                          disabled={saving}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.lectureTitle}>
                        {lecture.title || "Untitled lecture"}
                      </Text>

                      {!!lecture.topic && (
                        <Text style={styles.lectureTopic}>{lecture.topic}</Text>
                      )}

                      <View style={styles.lectureActions}>
                        <TouchableOpacity
                          style={styles.editLink}
                          onPress={() => startEditingLecture(lecture)}
                          disabled={saving}
                        >
                          <Text style={styles.editLinkText}>Edit Lecture</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteLectureLink}
                          onPress={() => confirmDeleteLecture(lecture)}
                          disabled={saving}
                        >
                          <Text style={styles.deleteLectureText}>
                            Delete Lecture
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  <LectureRecordings lectureId={lecture.id} />
                </View>
              );
            })}
          </View>
        ))}


      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.homeButtonText}>Return to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 22, marginTop: 12 },
  back: { color: NAVY, fontSize: 16, marginBottom: 16, fontWeight: "600" },
  heading: { fontSize: 28, fontWeight: "800", color: NAVY },
  subtitle: { fontSize: 14, color: MUTED, marginTop: 7, lineHeight: 21 },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E5EAF0",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
    marginBottom: 7,
    marginTop: 9,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: "#101828",
    marginBottom: 5,
  },
  multiline: { minHeight: 70, textAlignVertical: "top" },
  primaryButton: {
    backgroundColor: NAVY,
    padding: 14,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 14,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  disabled: { opacity: 0.6 },
  empty: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
  },
  emptyTitle: { color: NAVY, fontSize: 17, fontWeight: "700" },
  emptyText: { color: MUTED, marginTop: 7, textAlign: "center" },
  error: { color: "#B42318", textAlign: "center", marginBottom: 12 },
  outlineButton: {
    borderWidth: 1,
    borderColor: NAVY,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  outlineText: { color: NAVY, fontWeight: "600" },
  moduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5EAF0",
  },
  highlightedModuleCard: {
    borderColor: GOLD,
    borderWidth: 2,
    backgroundColor: "#FFFCF3",
  },
  moduleHeader: { flexDirection: "row", justifyContent: "space-between" },
  moduleInfo: { flex: 1, paddingRight: 12 },
  moduleName: { color: NAVY, fontSize: 17, fontWeight: "700" },
  moduleCode: { color: MUTED, marginTop: 4, fontSize: 13 },
  moduleDescription: { color: MUTED, marginTop: 5, lineHeight: 19 },
  deleteText: { color: "#B42318", fontWeight: "600", padding: 4 },
  divider: { height: 1, backgroundColor: "#EAECF0", marginVertical: 14 },
  secondaryButton: {
    backgroundColor: "#FFF4D6",
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 9,
    alignItems: "center",
    padding: 12,
    marginTop: 9,
  },
  secondaryButtonText: { color: NAVY, fontWeight: "700" },
  lectureCount: { color: MUTED, fontSize: 12, marginTop: 12, marginBottom: 5 },
  lectureRow: {
    backgroundColor: "#F5F7FA",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  highlightedLectureRow: {
    backgroundColor: "#FFF4D6",
    borderColor: GOLD,
    borderWidth: 2,
  },
  lectureTitle: { color: "#101828", fontWeight: "600" },
  lectureTopic: { color: MUTED, marginTop: 3, fontSize: 13 },
  homeButton: {
    backgroundColor: NAVY,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  homeButtonText: { color: "#FFFFFF", fontWeight: "700" },
  lectureActions: {
  flexDirection: "row",
  gap: 10,
  marginTop: 8,
},
editButton: {
  flex: 1,
  backgroundColor: NAVY,
  borderRadius: 8,
  padding: 11,
  alignItems: "center",
},
editButtonText: {
  color: "#FFFFFF",
  fontWeight: "700",
},
cancelButton: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#D0D5DD",
  borderRadius: 8,
  padding: 11,
  alignItems: "center",
},
cancelButtonText: {
  color: "#344054",
  fontWeight: "600",
},
editLink: {
  alignSelf: "flex-start",
  marginTop: 8,
  marginBottom: 4,
  paddingVertical: 5,
  paddingHorizontal: 8,
  borderRadius: 6,
  backgroundColor: "#FFF4D6",
},
editLinkText: {
  color: NAVY,
  fontWeight: "700",
  fontSize: 13,
},
deleteLectureLink: {
  alignSelf: "flex-start",
  marginTop: 8,
  marginBottom: 4,
  paddingVertical: 5,
  paddingHorizontal: 8,
  borderRadius: 6,
  backgroundColor: "#FEE4E2",
},

deleteLectureText: {
  color: "#B42318",
  fontWeight: "700",
  fontSize: 13,
},
});
