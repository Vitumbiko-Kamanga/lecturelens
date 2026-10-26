
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder,
} from "expo-audio";

import { api } from "../../services/api";
import styles from "../../styles/homeStyles";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const MUTED = "#667085";

function getItems(result, key) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.[key])) return result[key];
    return [];
}

export default function FloatingRecordButton() {
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectionVisible, setSelectionVisible] = useState(false);
    const [loadingLectures, setLoadingLectures] = useState(false);
    const [lectures, setLectures] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [selectionError, setSelectionError] = useState("");

    async function openLectureSelection() {
        setSelectionVisible(true);
        setLoadingLectures(true);
        setSelectionError("");
        setLectures([]);

        try {
            const moduleResult = await api.listModules();
            const modules = getItems(moduleResult, "modules");

            if (modules.length === 0) {
                setSelectionError(
                    "You have no modules yet. Create a module and add a lecture first."
                );
                return;
            }

            const groups = await Promise.all(
                modules.map(async (module) => {
                    const result = await api.listLectures(module.id);
                    const moduleLectures = getItems(result, "lectures");

                    return moduleLectures.map((lecture) => ({
                        ...lecture,
                        moduleName: module.name,
                    }));
                })
            );

            const allLectures = groups.flat();

            setLectures(allLectures);

            if (allLectures.length === 0) {
                setSelectionError(
                    "You have no saved lectures. Add a lecture before recording."
                );
            }
        } catch (error) {
            setSelectionError(
                error.message || "Could not load your lectures. Please try again."
            );
        } finally {
            setLoadingLectures(false);
        }
    }

    async function startRecording(lecture) {
        try {
            setIsProcessing(true);

            const permission =
                await AudioModule.requestRecordingPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    "Microphone permission required",
                    "Allow LectureLens to access your microphone in your device settings before recording."
                );
                return;
            }

            await setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
            });

            await recorder.prepareToRecordAsync();
            recorder.record();

            setSelectedLecture(lecture);
            setIsRecording(true);
        } catch (error) {
            console.error("Start recording error:", error);

            Alert.alert(
                "Recording failed",
                error?.message ||
                    "LectureLens could not start recording. Please try again."
            );
        } finally {
            setIsProcessing(false);
        }
    }

    async function stopRecording() {
        try {
            setIsProcessing(true);

            await recorder.stop();
            setIsRecording(false);

            await setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true,
            });

            const audioUri = recorder.uri;

            if (!audioUri) {
                Alert.alert(
                    "Recording stopped",
                    "The recording stopped, but no audio file location was returned."
                );
                return;
            }

            if (!selectedLecture?.id) {
                Alert.alert(
                    "Lecture not selected",
                    `The recording is on your device at:\n\n${audioUri}`
                );
                return;
            }

            try {
                const title =
                    `${selectedLecture.title || "Lecture recording"} - Recording`;

                const result = await api.uploadRecording(
                    selectedLecture.id,
                    audioUri,
                    title
                );

                Alert.alert(
                    "Upload successful",
                    `Your recording has been uploaded to:\n${selectedLecture.title || "Selected lecture"}`
                );

                console.log("LectureLens recording upload result:", result);
            } catch (uploadError) {
                console.error("Recording upload error:", uploadError);

                Alert.alert(
                    "Upload failed",
                    `Your recording is still available on your device:\n\n${audioUri}\n\nReason: ${
                        uploadError.message || "Please try again."
                    }`
                );
            }
        } catch (error) {
            console.error("Stop recording error:", error);

            Alert.alert(
                "Could not stop recording",
                error?.message ||
                    "Something went wrong while stopping the recording."
            );
        } finally {
            setIsRecording(false);
            setIsProcessing(false);
        }
    }

    async function handlePress() {
        if (isProcessing) return;

        if (isRecording) {
            await stopRecording();
            return;
        }

        await openLectureSelection();
    }

    async function handleLectureSelect(lecture) {
        setSelectionVisible(false);
        await startRecording(lecture);
    }

    return (
        <>
            <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                    style={[
                        styles.floatingButton,
                        isRecording && { backgroundColor: "#C62828" },
                        isProcessing && { opacity: 0.6 },
                    ]}
                    onPress={handlePress}
                    disabled={isProcessing}
                    accessibilityRole="button"
                    accessibilityLabel={
                        isRecording
                            ? "Stop and upload lecture recording"
                            : "Choose a lecture and start recording"
                    }
                >
                    <Ionicons
                        name={isRecording ? "stop" : "mic"}
                        size={32}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>

                {isRecording && (
                    <Text
                        style={{
                            marginTop: 6,
                            color: "#C62828",
                            fontWeight: "600",
                        }}
                    >
                        Recording: {selectedLecture?.title || "Lecture"}
                    </Text>
                )}

                {isProcessing && (
                    <Text style={{ marginTop: 4, fontSize: 12 }}>
                        Please wait...
                    </Text>
                )}
            </View>

            <Modal
                visible={selectionVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectionVisible(false)}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "flex-end",
                        backgroundColor: "rgba(0,0,0,0.45)",
                    }}
                >
                    <View
                        style={{
                            maxHeight: "75%",
                            backgroundColor: "#F5F7FA",
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            padding: 20,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 8,
                            }}
                        >
                            <Text
                                style={{
                                    color: NAVY,
                                    fontSize: 21,
                                    fontWeight: "800",
                                    flex: 1,
                                }}
                            >
                                Choose a lecture
                            </Text>

                            <TouchableOpacity
                                onPress={() => setSelectionVisible(false)}
                                accessibilityRole="button"
                                accessibilityLabel="Close lecture selection"
                            >
                                <Ionicons
                                    name="close"
                                    size={28}
                                    color={NAVY}
                                />
                            </TouchableOpacity>
                        </View>

                        <Text
                            style={{
                                color: MUTED,
                                marginBottom: 14,
                                lineHeight: 20,
                            }}
                        >
                            Select the lecture to which this recording should
                            be saved.
                        </Text>

                        {loadingLectures ? (
                            <View style={{ padding: 28, alignItems: "center" }}>
                                <ActivityIndicator size="large" color={NAVY} />
                                <Text style={{ marginTop: 10, color: MUTED }}>
                                    Loading your lectures...
                                </Text>
                            </View>
                        ) : selectionError ? (
                            <View style={{ paddingVertical: 16 }}>
                                <Text
                                    style={{
                                        color: selectionError.includes("Could not")
                                            ? "#B42318"
                                            : MUTED,
                                        lineHeight: 21,
                                    }}
                                >
                                    {selectionError}
                                </Text>

                                {selectionError.includes("Could not") && (
                                    <TouchableOpacity
                                        onPress={openLectureSelection}
                                        style={{
                                            backgroundColor: NAVY,
                                            padding: 12,
                                            borderRadius: 9,
                                            alignItems: "center",
                                            marginTop: 14,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: "#FFFFFF",
                                                fontWeight: "700",
                                            }}
                                        >
                                            Try again
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {!selectionError.includes("Could not") && (
                                    <TouchableOpacity
                                        onPress={() => setSelectionVisible(false)}
                                        style={{
                                            borderColor: NAVY,
                                            borderWidth: 1,
                                            padding: 12,
                                            borderRadius: 9,
                                            alignItems: "center",
                                            marginTop: 14,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: NAVY,
                                                fontWeight: "700",
                                            }}
                                        >
                                            Close
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ) : (
                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                {lectures.map((lecture) => (
                                    <TouchableOpacity
                                        key={String(lecture.id)}
                                        onPress={() => handleLectureSelect(lecture)}
                                        disabled={isProcessing}
                                        style={{
                                            backgroundColor: "#FFFFFF",
                                            borderWidth: 1,
                                            borderColor: GOLD,
                                            borderRadius: 12,
                                            padding: 15,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: NAVY,
                                                fontSize: 15,
                                                fontWeight: "700",
                                            }}
                                        >
                                            {lecture.title || "Untitled lecture"}
                                        </Text>

                                        <Text
                                            style={{
                                                color: MUTED,
                                                fontSize: 13,
                                                marginTop: 5,
                                            }}
                                        >
                                            {lecture.moduleName}
                                        </Text>

                                        {!!lecture.topic && (
                                            <Text
                                                style={{
                                                    color: MUTED,
                                                    fontSize: 13,
                                                    marginTop: 4,
                                                }}
                                            >
                                                {lecture.topic}
                                            </Text>
                                        )}

                                        <Text
                                            style={{
                                                color: NAVY,
                                                fontWeight: "700",
                                                marginTop: 10,
                                            }}
                                        >
                                            Select and record
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            onPress={() => setSelectionVisible(false)}
                            style={{
                                alignItems: "center",
                                padding: 13,
                                marginTop: 8,
                            }}
                        >
                            <Text style={{ color: NAVY, fontWeight: "600" }}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}
