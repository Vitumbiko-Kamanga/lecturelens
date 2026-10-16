
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/expo";

import NavBar from "../components/navbar";
import styles from "../styles/settingsStyles";

export default function Security() {
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function handleChangePassword() {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Missing information", "Please complete all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert("Password too short", "Your new password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Passwords do not match", "Please enter the same new password in both fields.");
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert("Choose a new password", "Your new password must be different from your current password.");
            return;
        }

        try {
            setIsSaving(true);

            await user.updatePassword({
                currentPassword,
                newPassword,
                signOutOfOtherSessions: true,
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            Alert.alert(
                "Password updated",
                "Your password has been changed successfully. Other active sessions have been signed out."
            );
        } catch (error) {
            Alert.alert(
                "Unable to change password",
                error?.errors?.[0]?.longMessage ||
                    error?.message ||
                    "Please check your current password and try again."
            );
        } finally {
            setIsSaving(false);
        }
    }

    if (!isLoaded) {
        return (
            <View style={styles.main}>
                <Text style={{ color: "#FFFFFF", margin: 24 }}>
                    Loading security settings...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.main}>
            <View
                style={{
                    marginTop: 50,
                    paddingHorizontal: 22,
                    marginBottom: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 20,
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    accessibilityLabel="Go back"
                >
                    <Ionicons
                        name="arrow-back-outline"
                        size={26}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>

                <Text style={styles.title}>Account & Security</Text>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={styles.container}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 30 }}
                >
                    <View
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: 16,
                            padding: 18,
                            marginBottom: 20,
                        }}
                    >
                        <Ionicons
                            name="shield-checkmark-outline"
                            size={32}
                            color="#2563EB"
                        />

                        <Text style={[styles.itemTitle, { marginTop: 12 }]}>
                            Change password
                        </Text>

                        <Text
                            style={[
                                styles.itemSubtitle,
                                { marginTop: 6, lineHeight: 20 },
                            ]}
                        >
                            Use your current password to set a new one.
                            Your other active sessions will be signed out.
                        </Text>
                    </View>

                    {[
                        {
                            label: "Current password",
                            value: currentPassword,
                            setter: setCurrentPassword,
                        },
                        {
                            label: "New password",
                            value: newPassword,
                            setter: setNewPassword,
                        },
                        {
                            label: "Confirm new password",
                            value: confirmPassword,
                            setter: setConfirmPassword,
                        },
                    ].map((field) => (
                        <View key={field.label} style={{ marginBottom: 16 }}>
                            <Text
                                style={[
                                    styles.itemTitle,
                                    { marginBottom: 8 },
                                ]}
                            >
                                {field.label}
                            </Text>

                            <TextInput
                                value={field.value}
                                onChangeText={field.setter}
                                placeholder={field.label}
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isSaving}
                                style={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: "#D1D5DB",
                                    paddingHorizontal: 14,
                                    paddingVertical: 13,
                                    color: "#111111",
                                }}
                            />
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={handleChangePassword}
                        disabled={isSaving || !user}
                        style={{
                            backgroundColor: isSaving ? "#9CA3AF" : "#2563EB",
                            padding: 16,
                            borderRadius: 12,
                            alignItems: "center",
                            marginTop: 8,
                        }}
                    >
                        <Text
                            style={{
                                color: "#FFFFFF",
                                fontWeight: "bold",
                                fontSize: 15,
                            }}
                        >
                            {isSaving ? "Updating password..." : "Update password"}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            <NavBar />
        </View>
    );
}
