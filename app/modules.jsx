
import React, { useCallback, useEffect, useState } from "react";
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
import { useRouter, useFocusEffect } from "expo-router";
import { api } from "../services/api";
import LectureRecordings from "../components/recordings/LectureRecordings";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const MUTED = "#667085";

export default function ModulesScreen() {
  const router = useRouter();

  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState({});
  const [moduleName, setModuleName] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [description, setDescription] = useState("");
  const [lectureTitles, setLectureTitles] = useState({});
  const [lectureTopics, setLectureTopics] = useState({});
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

      setLectures(Object.fromEntries(lectureResults));

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

      <Text style={styles.sectionTitle}>Your modules</Text>

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
      ) : (
        modules.map((module) => (
          <View key={module.id} style={styles.moduleCard}>
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
              </View>
              <TouchableOpacity onPress={() => confirmDelete(module)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>

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

            {(lectures[module.id]?.items || []).map((lecture) => (
              <View key={lecture.id} style={styles.lectureRow}>
                <Text style={styles.lectureTitle}>
                  {lecture.title || "Untitled lecture"}
                </Text>

                {!!lecture.topic && (
                  <Text style={styles.lectureTopic}>{lecture.topic}</Text>
                )}

                <LectureRecordings lectureId={lecture.id} />
              </View>
            ))}

          </View>
        ))
      )}

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
});
