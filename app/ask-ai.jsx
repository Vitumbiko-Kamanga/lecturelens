import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { api } from "../services/api";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const MUTED = "#667085";

export default function AskAI() {
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [recordings, setRecordings] = useState([]);

  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);

  const [loadingModules, setLoadingModules] = useState(true);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  const [checkingTranscript, setCheckingTranscript] = useState(false);

  const [transcriptAvailable, setTranscriptAvailable] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [conversation, setConversation] = useState([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadModules();
  }, []);

  function getItems(result, key) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.[key])) return result[key];
    return [];
  }

  async function loadModules() {
    try {
      setError("");
      const result = await api.listModules();
      setModules(getItems(result, "modules"));
    } catch (err) {
      setError(err.message || "Could not load your modules.");
    } finally {
      setLoadingModules(false);
    }
  }

  async function chooseModule(module) {
    setSelectedModule(module);
    setSelectedLecture(null);
    setSelectedRecording(null);
    setLectures([]);
    setRecordings([]);
    setTranscriptAvailable(false);
    setConversation([]);
    setAnswer("");

    try {
      setLoadingLectures(true);
      setError("");

      const result = await api.listLectures(module.id);
      setLectures(getItems(result, "lectures"));
    } catch (err) {
      setError(err.message || "Could not load lectures.");
    } finally {
      setLoadingLectures(false);
    }
  }

  async function chooseLecture(lecture) {
    setSelectedLecture(lecture);
    setSelectedRecording(null);
    setRecordings([]);
    setTranscriptAvailable(false);
    setConversation([]);
    setAnswer("");

    try {
      setLoadingRecordings(true);
      setError("");

      const result = await api.listRecordings(lecture.id);
      setRecordings(getItems(result, "recordings"));
    } catch (err) {
      setError(err.message || "Could not load lecture recordings.");
    } finally {
      setLoadingRecordings(false);
    }
  }

  async function chooseRecording(recording) {
    setSelectedRecording(recording);
    setTranscriptAvailable(false);
    setConversation([]);
    setAnswer("");
    setQuestion("");

    try {
      setCheckingTranscript(true);
      setError("");

      const result = await api.getRecordingTranscript(recording.id);
      const transcript = result?.transcript?.transcript;

      if (!transcript || !String(transcript).trim()) {
        throw new Error(
          "This recording does not have a usable transcript yet. Please transcribe it first."
        );
      }

      setTranscriptAvailable(true);
    } catch (err) {
      setError(
        err.message ||
          "Could not load this recording's transcript. Transcribe it first."
      );
    } finally {
      setCheckingTranscript(false);
    }
  }

  async function handleAskAI() {
    const trimmedQuestion = question.trim();

    if (!selectedRecording) {
      Alert.alert("Select a recording", "Please select a lecture recording first.");
      return;
    }

    if (!transcriptAvailable) {
      Alert.alert(
        "Transcript required",
        "Please select a recording with a saved transcript."
      );
      return;
    }

    if (!trimmedQuestion) {
      Alert.alert("Enter a question", "Type a question about your lecture.");
      return;
    }

    try {
      setAsking(true);
      setError("");

      const result = await api.askLectureQuestion(
        selectedRecording.id,
        trimmedQuestion
      );

      const generatedAnswer =
        typeof result?.answer === "string"
          ? result.answer.trim()
          : "";

      if (!generatedAnswer) {
        throw new Error("Gemini returned an empty answer. Please try again.");
      }

      setConversation((previous) => [
        ...previous,
        {
          question: trimmedQuestion,
          answer: generatedAnswer,
        },
      ]);

      setAnswer(generatedAnswer);
      setQuestion("");
    } catch (err) {
      setError(err.message || "Gemini could not answer your question.");
    } finally {
      setAsking(false);
    }
  }

  function resetSelection() {
    setSelectedModule(null);
    setSelectedLecture(null);
    setSelectedRecording(null);
    setLectures([]);
    setRecordings([]);
    setTranscriptAvailable(false);
    setConversation([]);
    setAnswer("");
    setQuestion("");
    setError("");
  }

  function renderSelectionItem(item, selected, onPress, title, subtitle) {
    return (
      <TouchableOpacity
        key={String(item.id)}
        style={[
          styles.selectionCard,
          selected && styles.selectedCard,
        ]}
        onPress={onPress}
        disabled={asking}
      >
        <View style={styles.selectionIcon}>
          <Ionicons
            name={selected ? "checkmark-circle" : "document-text-outline"}
            size={20}
            color={selected ? NAVY : MUTED}
          />
        </View>

        <View style={styles.selectionTextContainer}>
          <Text style={styles.selectionTitle}>
            {title || "Untitled"}
          </Text>

          {!!subtitle && (
            <Text style={styles.selectionSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>

        <Ionicons
          name={selected ? "chevron-down" : "chevron-forward"}
          size={18}
          color={MUTED}
        />
      </TouchableOpacity>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Ask AI",
          headerStyle: { backgroundColor: NAVY },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: { fontWeight: "700" },
        }}
      />

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="sparkles" size={27} color={NAVY} />
            </View>

            <Text style={styles.heroTitle}>
              Ask your lecture
            </Text>

            <Text style={styles.heroDescription}>
              Ask questions about your recorded lectures and get AI-powered
              explanations based on your saved transcripts.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select a module</Text>

            {loadingModules ? (
              <ActivityIndicator color={NAVY} />
            ) : modules.length === 0 ? (
              <Text style={styles.emptyText}>
                No modules found. Create a module first.
              </Text>
            ) : (
              modules.map((module) =>
                renderSelectionItem(
                  module,
                  String(selectedModule?.id) === String(module.id),
                  () => chooseModule(module),
                  module.name || module.title || module.module_name,
                  module.code || module.module_code || ""
                )
              )
            )}
          </View>

          {selectedModule && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Select a lecture</Text>

              {loadingLectures ? (
                <ActivityIndicator color={NAVY} />
              ) : lectures.length === 0 ? (
                <Text style={styles.emptyText}>
                  No lectures found in this module.
                </Text>
              ) : (
                lectures.map((lecture) =>
                  renderSelectionItem(
                    lecture,
                    String(selectedLecture?.id) === String(lecture.id),
                    () => chooseLecture(lecture),
                    lecture.title || lecture.name,
                    lecture.date
                      ? new Date(lecture.date).toLocaleDateString()
                      : ""
                  )
                )
              )}
            </View>
          )}

          {selectedLecture && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Select a recording</Text>

              {loadingRecordings ? (
                <ActivityIndicator color={NAVY} />
              ) : recordings.length === 0 ? (
                <Text style={styles.emptyText}>
                  No recordings found for this lecture.
                </Text>
              ) : (
                recordings.map((recording) =>
                  renderSelectionItem(
                    recording,
                    String(selectedRecording?.id) === String(recording.id),
                    () => chooseRecording(recording),
                    recording.title || "Lecture recording",
                    recording.created_at
                      ? new Date(recording.created_at).toLocaleDateString()
                      : ""
                  )
                )
              )}
            </View>
          )}

          {checkingTranscript && (
            <View style={styles.statusRow}>
              <ActivityIndicator color={NAVY} />
              <Text style={styles.statusText}>
                Checking saved transcript...
              </Text>
            </View>
          )}

          {selectedRecording && transcriptAvailable && (
            <View style={styles.readyCard}>
              <Ionicons
                name="checkmark-circle"
                size={21}
                color="#027A48"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.readyTitle}>
                  Transcript ready
                </Text>
                <Text style={styles.readyDescription}>
                  You can now ask questions about this recording.
                </Text>
              </View>
            </View>
          )}

          {selectedRecording && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Ask a question</Text>

              <TextInput
                style={styles.questionInput}
                value={question}
                onChangeText={setQuestion}
                placeholder="Example: Explain the main concepts discussed in this lecture."
                placeholderTextColor="#98A2B3"
                multiline
                textAlignVertical="top"
                editable={!asking}
              />

              <TouchableOpacity
                style={[
                  styles.askButton,
                  (asking || !transcriptAvailable) && styles.disabledButton,
                ]}
                onPress={handleAskAI}
                disabled={asking || !transcriptAvailable}
              >
                {asking ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                )}

                <Text style={styles.askButtonText}>
                  {asking ? "Gemini is thinking..." : "Ask Gemini"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!!error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {conversation.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lecture conversation</Text>

              {conversation.map((item, index) => (
                <View key={`conversation-${index}`}>
                  <View style={styles.questionCard}>
                    <Text style={styles.messageLabel}>Your question</Text>
                    <Text style={styles.questionText}>
                      {item.question}
                    </Text>
                  </View>

                  <View style={styles.answerCard}>
                    <View style={styles.answerHeader}>
                      <Ionicons
                        name="sparkles"
                        size={18}
                        color={NAVY}
                      />
                      <Text style={styles.answerTitle}>
                        Gemini's answer
                      </Text>
                    </View>

                    <Text style={styles.answerText}>
                      {item.answer}
                    </Text>
                  </View>
                </View>
              ))}

              <Text style={styles.disclaimer}>
                Review AI-generated answers against your lecture notes and
                transcript before using them in academic work.
              </Text>
            </View>
          )}

          {(selectedModule || selectedLecture || selectedRecording) && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetSelection}
              disabled={asking}
            >
              <Text style={styles.resetButtonText}>
                Start with another lecture
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  hero: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF0",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
  },

  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: "#FFF4D6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  heroTitle: {
    color: NAVY,
    fontSize: 22,
    fontWeight: "800",
  },

  heroDescription: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 10,
  },

  selectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EAF0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },

  selectedCard: {
    borderColor: GOLD,
    backgroundColor: "#FFF9EA",
  },

  selectionIcon: {
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },

  selectionTextContainer: {
    flex: 1,
  },

  selectionTitle: {
    color: "#101828",
    fontSize: 13,
    fontWeight: "700",
  },

  selectionSubtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 4,
  },

  emptyText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    paddingVertical: 8,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 15,
  },

  statusText: {
    color: MUTED,
    fontSize: 12,
  },

  readyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ECFDF3",
    borderColor: "#ABEFC6",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },

  readyTitle: {
    color: "#027A48",
    fontSize: 13,
    fontWeight: "700",
  },

  readyDescription: {
    color: "#344054",
    fontSize: 11,
    marginTop: 3,
  },

  questionInput: {
    minHeight: 110,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    padding: 13,
    color: "#101828",
    fontSize: 14,
    lineHeight: 21,
  },

  askButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.5,
  },

  askButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  errorCard: {
    backgroundColor: "#FEF3F2",
    borderWidth: 1,
    borderColor: "#FECDCA",
    borderRadius: 9,
    padding: 12,
    marginBottom: 15,
  },

  errorText: {
    color: "#B42318",
    fontSize: 12,
    lineHeight: 18,
  },

  questionCard: {
    backgroundColor: "#FFF4D6",
    borderRadius: 10,
    padding: 13,
    marginBottom: 9,
  },

  messageLabel: {
    color: NAVY,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 5,
  },

  questionText: {
    color: "#101828",
    fontSize: 13,
    lineHeight: 20,
  },

  answerCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    padding: 13,
    marginBottom: 15,
  },

  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 9,
  },

  answerTitle: {
    color: NAVY,
    fontSize: 13,
    fontWeight: "800",
  },

  answerText: {
    color: "#101828",
    fontSize: 13,
    lineHeight: 21,
  },

  disclaimer: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  resetButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 5,
  },

  resetButtonText: {
    color: NAVY,
    fontSize: 13,
    fontWeight: "700",
  },
});
