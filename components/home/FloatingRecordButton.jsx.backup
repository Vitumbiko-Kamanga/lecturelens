import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
} from "expo-audio";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";

import { api } from "../../services/api";
import {
  cacheLectures,
  getCachedLectures,
  getPendingRecordingCount,
  saveRecordingToQueue,
  uploadPendingRecordings,
} from "../../services/offlineRecordingService";

const NAVY = "#14335C";
const GOLD = "#F2B544";

function extractArray(response, possibleKeys = []) {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  for (const key of possibleKeys) {
    if (Array.isArray(response[key])) {
      return response[key];
    }
  }

  if (response.data) {
    return extractArray(response.data, possibleKeys);
  }

  if (response.result) {
    return extractArray(response.result, possibleKeys);
  }

  return [];
}

function getItemId(item) {
  return item?.id ?? item?.moduleId ?? item?.lectureId ?? item?._id;
}

function getItemTitle(item) {
  return (
    item?.title ||
    item?.name ||
    item?.moduleName ||
    item?.lectureTitle ||
    "Untitled"
  );
}

export default function FloatingRecordButton() {
  const { user } = useUser();
  const userId = user?.id;

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [modalVisible, setModalVisible] = useState(false);
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);

  const [loadingLectures, setLoadingLectures] = useState(false);
  const [recording, setRecording] = useState(false);
  const [savingRecording, setSavingRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    if (!userId) {
      setPendingCount(0);
      return;
    }

    try {
      const count = await getPendingRecordingCount(userId);
      setPendingCount(Number(count) || 0);
    } catch (error) {
      console.log("Unable to get pending recording count:", error);
    }
  }, [userId]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  const retryPendingUploads = useCallback(
    async (showMessage = true) => {
      if (!userId) {
        if (showMessage) {
          Alert.alert(
            "Sign in required",
            "Please sign in before uploading your recordings."
          );
        }
        return;
      }

      setUploading(true);

      try {
        await uploadPendingRecordings(userId);
        await refreshPendingCount();

        if (showMessage) {
          const remaining = await getPendingRecordingCount(userId);

          if (remaining === 0) {
            Alert.alert(
              "Upload complete",
              "Your pending recordings have been uploaded."
            );
          } else {
            Alert.alert(
              "Uploads pending",
              `${remaining} recording(s) are still waiting to upload.`
            );
          }
        }
      } catch (error) {
        console.log("Pending recording upload failed:", error);
        await refreshPendingCount();

        if (showMessage) {
          Alert.alert(
            "Upload not completed",
            "Your recordings are still saved on this device. Please try again when the internet connection is available."
          );
        }
      } finally {
        setUploading(false);
      }
    },
    [userId, refreshPendingCount]
  );

  const loadCachedLectures = useCallback(async () => {
    if (!userId) {
      return [];
    }

    try {
      const cached = await getCachedLectures(userId);
      const lectureList = Array.isArray(cached) ? cached : [];

      setLectures(lectureList);

      if (lectureList.length > 0) {
        const cachedModules = [];

        lectureList.forEach((lecture) => {
          const moduleId = lecture.moduleId;
          const moduleTitle = lecture.moduleTitle || "Cached module";

          if (
            moduleId &&
            !cachedModules.some((module) => String(module.id) === String(moduleId))
          ) {
            cachedModules.push({
              id: moduleId,
              title: moduleTitle,
            });
          }
        });

        setModules(cachedModules);
      }

      return lectureList;
    } catch (error) {
      console.log("Unable to load cached lectures:", error);
      return [];
    }
  }, [userId]);

  const loadModulesAndLectures = useCallback(async () => {
    if (!userId) {
      Alert.alert(
        "Sign in required",
        "Please sign in to access your modules and lectures."
      );
      return;
    }

    setLoadingLectures(true);

    try {
      const moduleResponse = await api.listModules();
      const moduleList = extractArray(moduleResponse, [
        "modules",
        "items",
      ]);

      const allLectures = [];

      for (const module of moduleList) {
        const moduleId = getItemId(module);

        if (!moduleId) {
          continue;
        }

        try {
          const lectureResponse = await api.listLectures(moduleId);
          const moduleLectures = extractArray(lectureResponse, [
            "lectures",
            "items",
          ]);

          moduleLectures.forEach((lecture) => {
            allLectures.push({
              ...lecture,
              moduleId,
              moduleTitle: getItemTitle(module),
            });
          });
        } catch (lectureError) {
          console.log(
            `Unable to load lectures for module ${moduleId}:`,
            lectureError
          );
        }
      }

      const formattedModules = moduleList
        .filter((module) => getItemId(module))
        .map((module) => ({
          ...module,
          id: getItemId(module),
          title: getItemTitle(module),
        }));

      setModules(formattedModules);
      setLectures(allLectures);

      await cacheLectures(userId, allLectures);

      if (allLectures.length === 0) {
        Alert.alert(
          "No lectures found",
          "Create a module and add a lecture before recording."
        );
      }

      retryPendingUploads(false);
    } catch (error) {
      console.log("Unable to load modules online:", error);

      const cachedLectures = await loadCachedLectures();

      if (cachedLectures.length === 0) {
        Alert.alert(
          "Offline lecture list unavailable",
          "Connect to the internet and open your lecture list once. Your lectures will then be available for offline recording."
        );
      } else {
        Alert.alert(
          "Offline mode",
          "Your saved lectures have been loaded. You can record and save audio while offline."
        );
      }
    } finally {
      setLoadingLectures(false);
    }
  }, [userId, loadCachedLectures, retryPendingUploads]);

  const openRecordingModal = async () => {
    setModalVisible(true);
    await loadModulesAndLectures();
  };

  const selectModule = (module) => {
    setSelectedModule(module);
    setSelectedLecture(null);
  };

  const startRecording = async () => {
    if (!selectedLecture) {
      Alert.alert("Select a lecture", "Please select a lecture first.");
      return;
    }

    try {
      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone permission",
          "LectureLens needs microphone permission to record lectures."
        );
        return;
      }

      await recorder.prepareToRecordAsync();
      recorder.record();

      setRecording(true);
    } catch (error) {
      console.log("Unable to start recording:", error);

      Alert.alert(
        "Recording error",
        error?.message || "The recording could not be started."
      );
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      return;
    }

    setSavingRecording(true);
    setRecording(false);

    try {
      await recorder.stop();

      const audioUri = recorder.uri;

      if (!audioUri) {
        throw new Error("The recording file could not be found.");
      }

      if (!userId) {
        Alert.alert(
          "Sign in required",
          "Please sign in before saving this recording to your account."
        );
        return;
      }

      const lectureId = getItemId(selectedLecture);

      if (!lectureId) {
        throw new Error("The selected lecture has no valid ID.");
      }

      const title = `${getItemTitle(selectedLecture)} - Recording`;

      await saveRecordingToQueue({
        userId,
        lecture: selectedLecture,
        audioUri,
        title,
      });

      await refreshPendingCount();

      Alert.alert(
        "Recording saved",
        "Your recording has been saved on this device. It will upload when an internet connection is available."
      );

      retryPendingUploads(false);
    } catch (error) {
      console.log("Unable to save recording:", error);

      Alert.alert(
        "Could not save recording",
        error?.message ||
          "The recording could not be saved to the offline queue."
      );
    } finally {
      setSavingRecording(false);
    }
  };

  const getModuleLectures = () => {
    if (!selectedModule) {
      return [];
    }

    return lectures.filter(
      (lecture) =>
        String(lecture.moduleId) === String(getItemId(selectedModule))
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={openRecordingModal}
        activeOpacity={0.85}
      >
        <Ionicons name="mic" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (!recording && !savingRecording) {
            setModalVisible(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Record a lecture</Text>
                <Text style={styles.modalSubtitle}>
                  Choose a module and lecture
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (recording || savingRecording) {
                    Alert.alert(
                      "Recording in progress",
                      "Stop and save the recording before closing this screen."
                    );
                    return;
                  }

                  setModalVisible(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={NAVY} />
              </TouchableOpacity>
            </View>

            {pendingCount > 0 && (
              <TouchableOpacity
                style={styles.pendingButton}
                onPress={() => retryPendingUploads(true)}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                )}

                <Text style={styles.pendingButtonText}>
                  {uploading
                    ? "Uploading..."
                    : `${pendingCount} pending recording(s) - Upload`}
                </Text>
              </TouchableOpacity>
            )}

            {loadingLectures ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={NAVY} />
                <Text style={styles.loadingText}>
                  Loading your modules and lectures...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.content}
                keyboardShouldPersistTaps="handled"
              >
                {!selectedModule ? (
                  <>
                    <Text style={styles.sectionTitle}>Your modules</Text>

                    {modules.length === 0 ? (
                      <Text style={styles.emptyText}>
                        No cached modules are available. Connect to the internet
                        and load your modules first.
                      </Text>
                    ) : (
                      modules.map((module) => (
                        <TouchableOpacity
                          key={String(getItemId(module))}
                          style={styles.listItem}
                          onPress={() => selectModule(module)}
                        >
                          <View style={styles.listItemIcon}>
                            <Ionicons
                              name="book-outline"
                              size={22}
                              color={NAVY}
                            />
                          </View>

                          <Text style={styles.listItemText}>
                            {getItemTitle(module)}
                          </Text>

                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#8A94A3"
                          />
                        </TouchableOpacity>
                      ))
                    )}
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => {
                        setSelectedModule(null);
                        setSelectedLecture(null);
                      }}
                    >
                      <Ionicons
                        name="arrow-back"
                        size={18}
                        color={NAVY}
                      />
                      <Text style={styles.backButtonText}>
                        Back to modules
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>
                      {getItemTitle(selectedModule)}
                    </Text>

                    {getModuleLectures().length === 0 ? (
                      <Text style={styles.emptyText}>
                        No cached lectures are available for this module.
                      </Text>
                    ) : (
                      getModuleLectures().map((lecture) => (
                        <TouchableOpacity
                          key={String(getItemId(lecture))}
                          style={[
                            styles.listItem,
                            selectedLecture &&
                              String(getItemId(selectedLecture)) ===
                                String(getItemId(lecture)) &&
                              styles.selectedListItem,
                          ]}
                          onPress={() => setSelectedLecture(lecture)}
                        >
                          <View style={styles.listItemIcon}>
                            <Ionicons
                              name="document-text-outline"
                              size={22}
                              color={NAVY}
                            />
                          </View>

                          <Text style={styles.listItemText}>
                            {getItemTitle(lecture)}
                          </Text>

                          {selectedLecture &&
                          String(getItemId(selectedLecture)) ===
                            String(getItemId(lecture)) ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={NAVY}
                            />
                          ) : (
                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color="#8A94A3"
                            />
                          )}
                        </TouchableOpacity>
                      ))
                    )}

                    <View style={styles.recordingControls}>
                      {recording ? (
                        <TouchableOpacity
                          style={styles.stopButton}
                          onPress={stopRecording}
                        >
                          <Ionicons
                            name="stop-circle"
                            size={24}
                            color="#FFFFFF"
                          />
                          <Text style={styles.controlButtonText}>
                            Stop and save recording
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.startButton,
                            (!selectedLecture || savingRecording) &&
                              styles.disabledButton,
                          ]}
                          onPress={startRecording}
                          disabled={!selectedLecture || savingRecording}
                        >
                          {savingRecording ? (
                            <ActivityIndicator color="#FFFFFF" />
                          ) : (
                            <Ionicons
                              name="radio-button-on"
                              size={24}
                              color="#FFFFFF"
                            />
                          )}

                          <Text style={styles.controlButtonText}>
                            {savingRecording
                              ? "Saving recording..."
                              : "Start recording"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 25,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: NAVY,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#697586",
    marginTop: 4,
  },
  closeButton: {
    padding: 6,
  },
  pendingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  pendingButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#697586",
    marginTop: 12,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 12,
  },
  emptyText: {
    color: "#697586",
    fontSize: 14,
    lineHeight: 21,
    paddingVertical: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6EAF0",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  selectedListItem: {
    borderColor: NAVY,
    backgroundColor: "#F1F5FA",
  },
  listItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    color: "#243247",
    fontSize: 15,
    fontWeight: "500",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 5,
  },
  backButtonText: {
    color: NAVY,
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },
  recordingControls: {
    marginTop: 18,
    marginBottom: 25,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B73535",
    borderRadius: 14,
    paddingVertical: 15,
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B73535",
    borderRadius: 14,
    paddingVertical: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
  controlButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 9,
  },
});
