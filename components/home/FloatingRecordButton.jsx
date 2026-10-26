
import React, { useState } from "react";
import {
    Alert,
    TouchableOpacity,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder,
} from "expo-audio";

import styles from "../../styles/homeStyles";

export default function FloatingRecordButton() {
    const recorder = useAudioRecorder(
        RecordingPresets.HIGH_QUALITY
    );

    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    async function startRecording() {
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

            if (audioUri) {
                Alert.alert(
                    "Recording saved",
                    `Your audio recording is available at:\n\n${audioUri}`,
                    [{ text: "OK" }]
                );

                console.log("LectureLens recording URI:", audioUri);
            } else {
                Alert.alert(
                    "Recording stopped",
                    "The recording stopped, but no audio file location was returned."
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
        if (isProcessing) {
            return;
        }

        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    }

    return (
        <View style={{ alignItems: "center" }}>
            <TouchableOpacity
                style={[
                    styles.floatingButton,
                    isRecording && {
                        backgroundColor: "#C62828",
                    },
                    isProcessing && {
                        opacity: 0.6,
                    },
                ]}
                onPress={handlePress}
                disabled={isProcessing}
                accessibilityRole="button"
                accessibilityLabel={
                    isRecording
                        ? "Stop lecture recording"
                        : "Start lecture recording"
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
                    Recording...
                </Text>
            )}

            {isProcessing && (
                <Text style={{ marginTop: 4, fontSize: 12 }}>
                    Please wait...
                </Text>
            )}
        </View>
    );
}
