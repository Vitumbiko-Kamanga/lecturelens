import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
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
const BACKGROUND = "#F5F7FA";
const BORDER = "#E5EAF0";

export default function ModulesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const selectedModuleId = Array.isArray(params.moduleId)
    ? params.moduleId[0]
    : params.moduleId;
  const selectedLectureId = Array.isArray(params.lectureId)
    ? params.lectureId[0]
    : params.lectureId;

  const scrollRef = useRef(null);
  const moduleRefs = useRef({});
  const lectureRefs = useRef({});
  const hasScrolledToSelection = useRef(false);

  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState({});
  const [expandedModuleId, setExpandedModuleId] = useState(selectedModuleId || null);
  const [expandedLectureId, setExpandedLectureId] = useState(selectedLectureId || null);

  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [moduleName, setModuleName] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [description, setDescription] = useState("");

  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingModuleName, setEditingModuleName] = useState("");
  const [editingModuleCode, setEditingModuleCode] = useState("");
  const [editingModuleDescription, setEditingModuleDescription] = useState("");

  const [lectureFormsOpen, setLectureFormsOpen] = useState({});
  const [lectureTitles, setLectureTitles] = useState({});
  const [lectureTopics, setLectureTopics] = useState({});
  const [editingLectureId, setEditingLectureId] = useState(null);
  const [editingLectureTitle, setEditingLectureTitle] = useState("");
  const [editingLectureTopic, setEditingLectureTopic] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    hasScrolledToSelection.current = false;
    if (selectedModuleId) setExpandedModuleId(selectedModuleId);
    if (selectedLectureId) {
      setExpandedLectureId(selectedLectureId);
      if (selectedModuleId) setExpandedModuleId(selectedModuleId);
    }
  }, [selectedModuleId, selectedLectureId]);

  const loadModules = useCallback(async () => {
    try {
      setError("");
      const result = await api.listModules();
      const items = Array.isArray(result) ? result : result?.modules || [];
      setModules(items);

      const lectureResults = await Promise.all(
        items.map(async (module) => {
          try {
            const lectureResult = await api.listLectures(module.id);
            return [
              module.id,
              {
                items: Array.isArray(lectureResult)
                  ? lectureResult
                  : lectureResult?.lectures || [],
                error: "",
              },
            ];
          } catch (err) {
            return [
              module.id,
              { items: [], error: err.message || "Could not load lectures." },
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
      setCreateModuleOpen(false);
      await loadModules();
      Alert.alert("Success", "Your module has been created.");
    } catch (err) {
      Alert.alert("Could not create module", err.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function cancelCreateModule() {
    setModuleName("");
    setModuleCode("");
    setDescription("");
    setCreateModuleOpen(false);
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
    if (!editingModuleName.trim()) {
      Alert.alert("Module name required", "Enter a name for the module.");
      return;
    }

    try {
      setSaving(true);
      await api.updateModule(module.id, {
        name: editingModuleName.trim(),
        code: editingModuleCode.trim(),
        description: editingModuleDescription.trim(),
      });
      cancelEditingModule();
      await loadModules();
      Alert.alert("Success", "Your module has been updated.");
    } catch (err) {
      Alert.alert("Could not update module", err.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDeleteModule(module) {
    Alert.alert(
      "Delete module?",
      `Are you sure you want to delete "${module.name}"? This may also affect associated lectures, notes and recordings.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await api.deleteModule(module.id);
              if (String(editingModuleId) === String(module.id)) {
                cancelEditingModule();
              }
              await loadModules();
              Alert.alert("Success", "Your module has been deleted.");
            } catch (err) {
              Alert.alert("Could not delete module", err.message || "Please try again.");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  }

  function toggleModule(moduleId) {
    setExpandedModuleId((current) =>
      String(current) === String(moduleId) ? null : moduleId
    );
  }

  function toggleLecture(lectureId) {
    setExpandedLectureId((current) =>
      String(current) === String(lectureId) ? null : lectureId
    );
  }

  function toggleLectureForm(moduleId) {
    setLectureFormsOpen((previous) => ({
      ...previous,
      [moduleId]: !previous[moduleId],
    }));
  }

  function cancelCreateLecture(moduleId) {
    setLectureTitles((previous) => ({ ...previous, [moduleId]: "" }));
    setLectureTopics((previous) => ({ ...previous, [moduleId]: "" }));
    setLectureFormsOpen((previous) => ({ ...previous, [moduleId]: false }));
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

      setLectureTitles((previous) => ({ ...previous, [module.id]: "" }));
      setLectureTopics((previous) => ({ ...previous, [module.id]: "" }));
      setLectureFormsOpen((previous) => ({ ...previous, [module.id]: false }));
      await loadModules();
      Alert.alert("Success", "Your lecture has been saved.");
    } catch (err) {
      Alert.alert("Could not create lecture", err.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function startEditingLecture(lecture) {
    setEditingLectureId(lecture.id);
    setEditingLectureTitle(lecture.title || "");
    setEditingLectureTopic(lecture.topic || "");
    setExpandedLectureId(lecture.id);
  }

  function cancelEditingLecture() {
    setEditingLectureId(null);
    setEditingLectureTitle("");
    setEditingLectureTopic("");
  }

  async function handleUpdateLecture(lecture) {
    if (!editingLectureTitle.trim()) {
      Alert.alert("Lecture title required", "Enter a title for the lecture.");
      return;
    }

    try {
      setSaving(true);
      await api.updateLecture(lecture.id, {
        title: editingLectureTitle.trim(),
        topic: editingLectureTopic.trim(),
      });
      cancelEditingLecture();
      await loadModules();
      Alert.alert("Success", "Your lecture has been updated.");
    } catch (err) {
      Alert.alert("Could not update lecture", err.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLecture(lecture) {
    try {
      setSaving(true);
      await api.deleteLecture(lecture.id);

      if (String(expandedLectureId) === String(lecture.id)) {
        setExpandedLectureId(null);
      }
      if (String(editingLectureId) === String(lecture.id)) {
        cancelEditingLecture();
      }

      await loadModules();
      Alert.alert("Success", "The lecture has been deleted.");
    } catch (err) {
      Alert.alert("Could not delete lecture", err.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDeleteLecture(lecture) {
    Alert.alert(
      "Delete lecture?",
      `Are you sure you want to delete "${lecture.title || "Untitled lecture"}"? This may affect associated notes and recordings.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteLecture(lecture),
        },
      ]
    );
  }

  useEffect(() => {
    if (loading || !selectedModuleId || hasScrolledToSelection.current) return;

    const moduleNode = moduleRefs.current[String(selectedModuleId)];
    const lectureNode = selectedLectureId
      ? lectureRefs.current[String(selectedLectureId)]
      : null;

    if (!moduleNode && !lectureNode) return;

    hasScrolledToSelection.current = true;
    requestAnimationFrame(() => {
      const target = lectureNode || moduleNode;
      if (target?.measureLayout) {
        target.measureLayout(
          scrollRef.current,
          (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 18), animated: true }),
          () => {}
        );
      }
    });
  }, [loading, modules, lectures, selectedModuleId, selectedLectureId]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY} />

      <View style={styles.stickyHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Manage Modules</Text>
          <Text style={styles.headerSubtitle}>Organise your learning</Text>
        </View>

        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introSection}>
          <Text style={styles.pageEyebrow}>YOUR STUDY SPACE</Text>
          <Text style={styles.pageTitle}>My Modules</Text>
          <Text style={styles.pageSubtitle}>
            Manage your modules and keep lectures organised in one place.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createModuleToggle, createModuleOpen && styles.createModuleToggleActive]}
          onPress={() => setCreateModuleOpen((open) => !open)}
          disabled={saving}
          activeOpacity={0.85}
        >
          <View style={styles.createModuleIcon}>
            <Text style={styles.createModuleIconText}>{createModuleOpen ? "−" : "+"}</Text>
          </View>
          <View style={styles.createModuleToggleTextContainer}>
            <Text style={styles.createModuleToggleTitle}>
              {createModuleOpen ? "Close module form" : "Create a module"}
            </Text>
            <Text style={styles.createModuleToggleSubtitle}>
              {createModuleOpen ? "Hide the form" : "Add a course or subject to your study space"}
            </Text>
          </View>
          <Text style={styles.toggleChevron}>{createModuleOpen ? "⌃" : "⌄"}</Text>
        </TouchableOpacity>

        {createModuleOpen && (
          <View style={styles.formCard}>
            <View style={styles.formHeadingRow}>
              <View style={styles.formHeadingIcon}>
                <Text style={styles.formHeadingIconText}>＋</Text>
              </View>
              <View style={styles.formHeadingText}>
                <Text style={styles.formTitle}>New module</Text>
                <Text style={styles.formSubtitle}>Add the details for your module below.</Text>
              </View>
            </View>

            <Text style={styles.label}>Module name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Database Administration"
              placeholderTextColor="#98A2B3"
              value={moduleName}
              onChangeText={setModuleName}
              editable={!saving}
              returnKeyType="next"
            />

            <Text style={styles.label}>Module code (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. BIT 420"
              placeholderTextColor="#98A2B3"
              value={moduleCode}
              onChangeText={setModuleCode}
              autoCapitalize="characters"
              editable={!saving}
              returnKeyType="next"
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Add a short description"
              placeholderTextColor="#98A2B3"
              value={description}
              onChangeText={setDescription}
              multiline
              editable={!saving}
            />

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.primaryButton, saving && styles.disabled]}
                onPress={handleCreateModule}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Save Module</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.formCancelButton} onPress={cancelCreateModule} disabled={saving}>
                <Text style={styles.formCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.listHeader}>
          <View>
            <Text style={styles.listTitle}>Your modules</Text>
            <Text style={styles.listSubtitle}>
              {modules.length} {modules.length === 1 ? "module" : "modules"} in your study space
            </Text>
          </View>
          <TouchableOpacity
            onPress={loadModules}
            disabled={loading || saving}
            style={[styles.refreshButton, (loading || saving) && styles.disabled]}
          >
            <Text style={styles.refreshIcon}>↻</Text>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={NAVY} />
            <Text style={styles.loadingText}>Loading your modules...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Could not load modules</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.outlineButton} onPress={loadModules}>
              <Text style={styles.outlineText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : modules.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}><Text style={styles.emptyIcon}>▤</Text></View>
            <Text style={styles.emptyTitle}>No modules yet</Text>
            <Text style={styles.emptyText}>
              Create your first module to start organising lectures and notes.
            </Text>
            <TouchableOpacity style={styles.emptyCreateButton} onPress={() => setCreateModuleOpen(true)}>
              <Text style={styles.emptyCreateButtonText}>+ Create your first module</Text>
            </TouchableOpacity>
          </View>
        ) : (
          modules.map((module) => {
            const moduleLectures = lectures[module.id]?.items || [];
            const moduleExpanded = String(expandedModuleId) === String(module.id);

            return (
              <View
                key={module.id}
                ref={(node) => {
                  if (node) moduleRefs.current[String(module.id)] = node;
                }}
                style={[
                  styles.moduleCard,
                  String(module.id) === String(selectedModuleId) && styles.highlightedModuleCard,
                ]}
              >
                {editingModuleId === module.id ? (
                  <View>
                    <Text style={styles.formSectionTitle}>Edit module details</Text>
                    <Text style={styles.label}>Module name *</Text>
                    <TextInput style={styles.input} placeholder="Module name" value={editingModuleName} onChangeText={setEditingModuleName} editable={!saving} />
                    <Text style={styles.label}>Module code (optional)</Text>
                    <TextInput style={styles.input} placeholder="Module code" value={editingModuleCode} onChangeText={setEditingModuleCode} autoCapitalize="characters" editable={!saving} />
                    <Text style={styles.label}>Description (optional)</Text>
                    <TextInput style={[styles.input, styles.multiline]} placeholder="Module description" value={editingModuleDescription} onChangeText={setEditingModuleDescription} multiline editable={!saving} />
                    <View style={styles.formActions}>
                      <TouchableOpacity style={[styles.primaryButton, saving && styles.disabled]} onPress={() => handleUpdateModule(module)} disabled={saving}>
                        <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Save Changes"}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.formCancelButton} onPress={cancelEditingModule} disabled={saving}>
                        <Text style={styles.formCancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity style={styles.moduleHeaderTap} onPress={() => toggleModule(module.id)} activeOpacity={0.8}>
                      <View style={styles.moduleIconBox}><Text style={styles.moduleIconText}>▤</Text></View>
                      <View style={styles.moduleInfo}>
                        <Text style={styles.moduleName}>{module.name}</Text>
                        {!!module.code && <Text style={styles.moduleCode}>{module.code}</Text>}
                        {!!module.description && <Text style={styles.moduleDescription}>{module.description}</Text>}
                      </View>
                      <View style={styles.moduleHeaderRight}>
                        <View style={styles.moduleLectureBadge}>
                          <Text style={styles.moduleLectureBadgeText}>
                            {moduleLectures.length} {moduleLectures.length === 1 ? "lecture" : "lectures"}
                          </Text>
                        </View>
                        <Text style={styles.moduleChevron}>{moduleExpanded ? "⌃" : "⌄"}</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.moduleActionRow}>
                      <TouchableOpacity style={styles.editModuleButton} onPress={() => startEditingModule(module)} disabled={saving}>
                        <Text style={styles.editModuleButtonText}>Edit module</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteModuleButton} onPress={() => confirmDeleteModule(module)} disabled={saving}>
                        <Text style={styles.deleteModuleButtonText}>Delete module</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {editingModuleId !== module.id && moduleExpanded && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.lecturesSectionHeader}>
                      <View style={styles.lecturesSectionText}>
                        <Text style={styles.lecturesSectionTitle}>Lectures</Text>
                        <Text style={styles.lecturesSectionSubtitle}>
                          Tap a lecture title to open its recording and study workspace.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.addLectureButton, lectureFormsOpen[module.id] && styles.addLectureButtonActive]}
                        onPress={() => toggleLectureForm(module.id)}
                        disabled={saving}
                      >
                        <Text style={[styles.addLectureButtonText, lectureFormsOpen[module.id] && styles.addLectureButtonTextActive]}>
                          {lectureFormsOpen[module.id] ? "− Close" : "+ Add"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {lectureFormsOpen[module.id] && (
                      <View style={styles.lectureFormCard}>
                        <Text style={styles.lectureFormTitle}>New lecture</Text>
                        <Text style={styles.label}>Lecture title *</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. Introduction to Database Systems"
                          placeholderTextColor="#98A2B3"
                          value={lectureTitles[module.id] || ""}
                          onChangeText={(value) => setLectureTitles((previous) => ({ ...previous, [module.id]: value }))}
                          editable={!saving}
                          returnKeyType="next"
                        />
                        <Text style={styles.label}>Topic (optional)</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. Relational database concepts"
                          placeholderTextColor="#98A2B3"
                          value={lectureTopics[module.id] || ""}
                          onChangeText={(value) => setLectureTopics((previous) => ({ ...previous, [module.id]: value }))}
                          editable={!saving}
                        />
                        <View style={styles.formActions}>
                          <TouchableOpacity style={[styles.primaryButton, saving && styles.disabled]} onPress={() => handleCreateLecture(module)} disabled={saving}>
                            <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Save Lecture"}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.formCancelButton} onPress={() => cancelCreateLecture(module.id)} disabled={saving}>
                            <Text style={styles.formCancelText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {!!lectures[module.id]?.error && (
                      <Text style={styles.error}>
                        Could not load this module's lectures: {lectures[module.id].error}
                      </Text>
                    )}

                    {moduleLectures.length === 0 ? (
                      <View style={styles.noLectures}>
                        <Text style={styles.noLecturesTitle}>No lectures added yet</Text>
                        <Text style={styles.noLecturesText}>Tap “Add” to create the first lecture for this module.</Text>
                      </View>
                    ) : (
                      moduleLectures.map((lecture, index) => {
                        const lectureExpanded = String(expandedLectureId) === String(lecture.id);
                        const isEditingLecture = String(editingLectureId) === String(lecture.id);

                        return (
                          <View
                            key={lecture.id}
                            ref={(node) => {
                              if (node) lectureRefs.current[String(lecture.id)] = node;
                            }}
                            style={[
                              styles.lectureCard,
                              String(lecture.id) === String(selectedLectureId) && styles.highlightedLectureCard,
                              lectureExpanded && styles.lectureCardExpanded,
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.lectureTitleRow}
                              onPress={() => toggleLecture(lecture.id)}
                              activeOpacity={0.8}
                              accessibilityRole="button"
                              accessibilityLabel={`${lecture.title || "Untitled lecture"}, ${lectureExpanded ? "collapse details" : "expand details"}`}
                            >
                              <View style={styles.lectureNumberCircle}>
                                <Text style={styles.lectureNumberText}>{index + 1}</Text>
                              </View>
                              <View style={styles.lectureTitleContainer}>
                                <Text style={styles.lectureTitle} numberOfLines={2}>
                                  {lecture.title || "Untitled lecture"}
                                </Text>
                              </View>
                              <Text style={styles.lectureChevron}>{lectureExpanded ? "⌃" : "›"}</Text>
                            </TouchableOpacity>

                            {lectureExpanded && (
                              <View style={styles.lectureExpandedContent}>
                                {!!lecture.topic && !isEditingLecture && (
                                  <Text style={styles.lectureTopic}>{lecture.topic}</Text>
                                )}

                                <View style={styles.lectureManagementActions}>
                                  <TouchableOpacity style={styles.editLink} onPress={() => startEditingLecture(lecture)} disabled={saving}>
                                    <Text style={styles.editLinkText}>Edit lecture</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={styles.deleteLectureLink} onPress={() => confirmDeleteLecture(lecture)} disabled={saving}>
                                    <Text style={styles.deleteLectureText}>Delete lecture</Text>
                                  </TouchableOpacity>
                                </View>

                                {isEditingLecture && (
                                  <View style={styles.editLectureForm}>
                                    <Text style={styles.label}>Lecture title *</Text>
                                    <TextInput style={styles.input} placeholder="Lecture title" value={editingLectureTitle} onChangeText={setEditingLectureTitle} editable={!saving} />
                                    <Text style={styles.label}>Topic (optional)</Text>
                                    <TextInput style={styles.input} placeholder="Lecture topic" value={editingLectureTopic} onChangeText={setEditingLectureTopic} editable={!saving} />
                                    <View style={styles.formActions}>
                                      <TouchableOpacity style={[styles.primaryButton, saving && styles.disabled]} onPress={() => handleUpdateLecture(lecture)} disabled={saving}>
                                        <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Save Changes"}</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={styles.formCancelButton} onPress={cancelEditingLecture} disabled={saving}>
                                        <Text style={styles.formCancelText}>Cancel</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                )}

                                <View style={styles.recordingsHeading}>
                                  <View style={styles.recordingsIcon}>
                                    <Text style={styles.recordingsIconText}>♫</Text>
                                  </View>
                                  <View style={styles.recordingsHeadingText}>
                                    <Text style={styles.recordingsTitle}>Lecture workspace</Text>
                                    <Text style={styles.recordingsSubtitle}>
                                      Record, review, transcribe and manage lecture materials.
                                    </Text>
                                  </View>
                                </View>

                                <LectureRecordings lectureId={lecture.id} />
                              </View>
                            )}
                          </View>
                        );
                      })
                    )}
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  stickyHeader: {
    minHeight: Platform.OS === "ios" ? 96 : 76,
    paddingTop: Platform.OS === "ios" ? 42 : 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: NAVY,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: GOLD,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    zIndex: 10,
  },
  backButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  backArrow: { color: "#FFF", fontSize: 34, lineHeight: 38, fontWeight: "400", marginTop: -3 },
  headerTitleContainer: { flex: 1, marginLeft: 12 },
  headerTitle: { color: "#FFF", fontSize: 19, fontWeight: "800" },
  headerSubtitle: { color: "#DCE6F2", fontSize: 12, marginTop: 3 },
  headerRightSpace: { width: 10 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 42 },
  introSection: { marginBottom: 20 },
  pageEyebrow: { color: "#A06B00", fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginBottom: 6 },
  pageTitle: { color: NAVY, fontSize: 27, fontWeight: "800" },
  pageSubtitle: { color: MUTED, fontSize: 14, lineHeight: 21, marginTop: 6 },
  createModuleToggle: { backgroundColor: NAVY, borderRadius: 15, padding: 15, flexDirection: "row", alignItems: "center", marginBottom: 18, shadowColor: NAVY, shadowOpacity: 0.13, shadowOffset: { width: 0, height: 4 }, shadowRadius: 7, elevation: 3 },
  createModuleToggleActive: { backgroundColor: "#1A426F" },
  createModuleIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
  createModuleIconText: { color: NAVY, fontSize: 28, fontWeight: "700", marginTop: -2 },
  createModuleToggleTextContainer: { flex: 1, marginLeft: 12 },
  createModuleToggleTitle: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  createModuleToggleSubtitle: { color: "#DCE6F2", fontSize: 12, marginTop: 4, lineHeight: 17 },
  toggleChevron: { color: "#FFF", fontSize: 22, marginLeft: 8 },
  formCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 17, marginBottom: 22, borderWidth: 1, borderColor: BORDER, shadowColor: "#101828", shadowOpacity: 0.04, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 1 },
  formHeadingRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  formHeadingIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: "#FFF4D6", alignItems: "center", justifyContent: "center" },
  formHeadingIconText: { color: NAVY, fontSize: 24, fontWeight: "700" },
  formHeadingText: { flex: 1, marginLeft: 10 },
  formTitle: { color: NAVY, fontSize: 17, fontWeight: "800" },
  formSubtitle: { color: MUTED, fontSize: 12, marginTop: 3 },
  formSectionTitle: { color: NAVY, fontSize: 17, fontWeight: "800", marginBottom: 6 },
  label: { fontSize: 13, fontWeight: "700", color: "#344054", marginBottom: 7, marginTop: 11 },
  input: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#D0D5DD", borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12, fontSize: 15, color: "#101828", marginBottom: 5 },
  multiline: { minHeight: 82, textAlignVertical: "top" },
  formActions: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  primaryButton: { flex: 1, minHeight: 46, backgroundColor: NAVY, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "#FFF", fontWeight: "800", fontSize: 14, textAlign: "center" },
  formCancelButton: { minHeight: 46, minWidth: 90, borderWidth: 1, borderColor: "#D0D5DD", backgroundColor: "#FFF", borderRadius: 10, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  formCancelText: { color: "#344054", fontWeight: "700" },
  disabled: { opacity: 0.55 },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  listTitle: { color: NAVY, fontSize: 20, fontWeight: "800" },
  listSubtitle: { color: MUTED, fontSize: 12, marginTop: 4 },
  refreshButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderWidth: 1, borderColor: BORDER, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8 },
  refreshIcon: { color: NAVY, fontSize: 17, marginRight: 5 },
  refreshText: { color: NAVY, fontWeight: "700", fontSize: 12 },
  loadingContainer: { paddingVertical: 35, alignItems: "center" },
  loadingText: { color: MUTED, fontSize: 13, marginTop: 10 },
  emptyCard: { backgroundColor: "#FFF", borderRadius: 15, padding: 22, alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  emptyIconCircle: { width: 54, height: 54, borderRadius: 17, backgroundColor: "#FFF4D6", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyIcon: { color: NAVY, fontSize: 25 },
  emptyTitle: { color: NAVY, fontSize: 17, fontWeight: "800", textAlign: "center" },
  emptyText: { color: MUTED, fontSize: 13, lineHeight: 19, marginTop: 7, textAlign: "center" },
  emptyCreateButton: { backgroundColor: NAVY, borderRadius: 9, paddingHorizontal: 15, paddingVertical: 11, marginTop: 15 },
  emptyCreateButtonText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  outlineButton: { borderWidth: 1, borderColor: NAVY, borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, marginTop: 12 },
  outlineText: { color: NAVY, fontWeight: "700" },
  error: { color: "#B42318", fontSize: 13, marginVertical: 10 },
  moduleCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 15, marginBottom: 16, borderWidth: 1, borderColor: BORDER, shadowColor: "#101828", shadowOpacity: 0.045, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 2 },
  highlightedModuleCard: { borderColor: GOLD, borderWidth: 2, backgroundColor: "#FFFCF3" },
  moduleHeaderTap: { flexDirection: "row", alignItems: "flex-start" },
  moduleIconBox: { width: 43, height: 43, borderRadius: 12, backgroundColor: "#EAF0F7", alignItems: "center", justifyContent: "center" },
  moduleIconText: { color: NAVY, fontSize: 23 },
  moduleInfo: { flex: 1, paddingHorizontal: 11 },
  moduleName: { color: NAVY, fontSize: 17, fontWeight: "800", lineHeight: 23 },
  moduleCode: { color: "#8A5A00", fontSize: 12, fontWeight: "700", marginTop: 4 },
  moduleDescription: { color: MUTED, fontSize: 13, marginTop: 6, lineHeight: 19 },
  moduleHeaderRight: { alignItems: "flex-end", gap: 5 },
  moduleChevron: { color: NAVY, fontSize: 22, fontWeight: "700" },
  moduleActionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  editModuleButton: { backgroundColor: "#FFF4D6", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 7 },
  editModuleButtonText: { color: NAVY, fontSize: 12, fontWeight: "800" },
  deleteModuleButton: { backgroundColor: "#FEE4E2", borderRadius: 8, paddingHorizontal: 11, paddingVertical: 7 },
  deleteModuleButtonText: { color: "#B42318", fontSize: 12, fontWeight: "800" },
  moduleLectureBadge: { backgroundColor: "#F2F4F7", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  moduleLectureBadgeText: { color: MUTED, fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#EAECF0", marginVertical: 15 },
  lecturesSectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 11 },
  lecturesSectionText: { flex: 1, minWidth: 0 },
  lecturesSectionTitle: { color: NAVY, fontSize: 16, fontWeight: "800" },
  lecturesSectionSubtitle: { color: MUTED, fontSize: 11, lineHeight: 16, marginTop: 3, paddingRight: 8 },
  addLectureButton: { backgroundColor: NAVY, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9, marginLeft: 8 },
  addLectureButtonActive: { backgroundColor: "#EAF0F7", borderWidth: 1, borderColor: "#C8D5E5" },
  addLectureButtonText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  addLectureButtonTextActive: { color: NAVY },
  lectureFormCard: { backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#DCE4EE", padding: 13, marginBottom: 12 },
  lectureFormTitle: { color: NAVY, fontSize: 15, fontWeight: "800" },
  noLectures: { backgroundColor: "#F8FAFC", borderRadius: 10, padding: 13, borderWidth: 1, borderColor: "#EEF2F6" },
  noLecturesTitle: { color: "#344054", fontSize: 13, fontWeight: "700" },
  noLecturesText: { color: MUTED, fontSize: 12, lineHeight: 18, marginTop: 4 },
  lectureCard: { backgroundColor: "#F8FAFC", borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: "#E8EDF3", overflow: "hidden" },
  highlightedLectureCard: { borderColor: GOLD, backgroundColor: "#FFF8E6" },
  lectureCardExpanded: { borderColor: "#C8D5E5", backgroundColor: "#FFF" },
  lectureTitleRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 13, minHeight: 58 },
  lectureNumberCircle: { width: 29, height: 29, borderRadius: 9, backgroundColor: "#EAF0F7", alignItems: "center", justifyContent: "center", marginRight: 10 },
  lectureNumberText: { color: NAVY, fontSize: 12, fontWeight: "800" },
  lectureTitleContainer: { flex: 1, minWidth: 0 },
  lectureTitle: { color: "#101828", fontWeight: "800", fontSize: 14, lineHeight: 20 },
  lectureChevron: { color: NAVY, fontSize: 23, marginLeft: 10, fontWeight: "600" },
  lectureExpandedContent: { borderTopWidth: 1, borderTopColor: "#EAECF0", padding: 13 },
  lectureTopic: { color: MUTED, marginBottom: 8, fontSize: 12, lineHeight: 17 },
  lectureManagementActions: { flexDirection: "row", gap: 8, marginBottom: 12 },
  editLink: { alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 7, backgroundColor: "#FFF4D6" },
  editLinkText: { color: NAVY, fontWeight: "800", fontSize: 12 },
  deleteLectureLink: { alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 7, backgroundColor: "#FEE4E2" },
  deleteLectureText: { color: "#B42318", fontWeight: "800", fontSize: 12 },
  editLectureForm: { backgroundColor: "#F8FAFC", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: BORDER, marginBottom: 12 },
  recordingsHeading: { flexDirection: "row", alignItems: "center", backgroundColor: "#EAF0F7", borderRadius: 10, padding: 11, marginBottom: 10 },
  recordingsIcon: { width: 35, height: 35, borderRadius: 10, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
  recordingsIconText: { color: NAVY, fontSize: 20, fontWeight: "800" },
  recordingsHeadingText: { flex: 1, marginLeft: 10 },
  recordingsTitle: { color: NAVY, fontSize: 14, fontWeight: "800" },
  recordingsSubtitle: { color: MUTED, fontSize: 11, lineHeight: 16, marginTop: 2 },
});
