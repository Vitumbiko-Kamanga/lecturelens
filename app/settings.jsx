import React, { useState } from "react";
import {
  ScrollView,
  View,
  Alert,
  Linking,
} from "react-native";
import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";

import styles from "../styles/settingsStyles";

import NavBar from "../components/navbar";
import ResponsiveScreen from "../components/common/ResponsiveScreen";
import SettingsHeader from "../components/settings/SettingsHeader";
import ProfileCard from "../components/settings/ProfileCard";
import SectionTitle from "../components/settings/SectionTitle";
import SettingItem from "../components/settings/SettingItem";
import LogoutButton from "../components/settings/LogoutButton";
import SettingSwitch from "../components/settings/SettingSwitch";

export default function Settings() {
  const { signOut } = useClerk();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [offline, setOffline] = useState(false);

  const showComingSoon = (feature) => {
    Alert.alert(
      feature,
      "This feature is not fully available yet. It will be implemented in a future update."
    );
  };

  const handleContact = async () => {
    const emailUrl = "mailto:support@lecturelens.app";

    try {
      await Linking.openURL(emailUrl);
    } catch (error) {
      Alert.alert(
        "Contact Us",
        "Email support is not configured yet."
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of LectureLens?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert(
                "Logout Failed",
                error?.message ||
                  "Unable to log out. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ResponsiveScreen
      scroll={false}
      contentStyle={{ paddingHorizontal: 0 }}
    >
      <View style={styles.main}>
        <SettingsHeader />

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 160 },
          ]}
        >
          <ProfileCard
            onPress={() => router.push("/profile")}
          />

          <SectionTitle title="ACCOUNT" />

          <SettingItem
            icon="person-outline"
            title="Profile Information"
            subtitle="View and edit your profile"
            onPress={() => router.push("/profile")}
          />

          <SettingItem
            icon="shield-checkmark-outline"
            title="Account & Security"
            subtitle="Password and security settings"
            onPress={() => router.push("/security")}
          />

          <SettingItem
            icon="cloud-outline"
            title="Backup & Sync"
            subtitle="Manage cloud backup"
            onPress={() => showComingSoon("Backup & Sync")}
          />

          <SectionTitle title="PREFERENCES" />

          <SettingSwitch
            icon="notifications-outline"
            title="Notifications"
            subtitle={
              notifications
                ? "Notifications enabled"
                : "Notifications disabled"
            }
            value={notifications}
            onValueChange={setNotifications}
          />

          <SettingItem
            icon="color-palette-outline"
            title="Appearance"
            subtitle="Light Theme"
            onPress={() => showComingSoon("Appearance")}
          />

          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => showComingSoon("Language")}
          />

          <SettingSwitch
            icon="download-outline"
            title="Offline Mode"
            subtitle={
              offline
                ? "Offline mode enabled"
                : "Offline mode disabled"
            }
            value={offline}
            onValueChange={(value) => {
              setOffline(value);

              Alert.alert(
                value ? "Offline Mode" : "Offline Mode Disabled",
                value
                  ? "Offline mode is enabled in Settings. Downloading and accessing content offline will require the offline feature to be implemented."
                  : "Offline mode has been disabled."
              );
            }}
          />

          <SectionTitle title="SUPPORT" />

          <SettingItem
            icon="help-circle-outline"
            title="Help & FAQ"
            subtitle="Find answers"
            onPress={() => showComingSoon("Help & FAQ")}
          />

          <SettingItem
            icon="chatbubble-outline"
            title="Contact Us"
            subtitle="We're here to help"
            onPress={handleContact}
          />

          <SettingItem
            icon="information-circle-outline"
            title="About LectureLens"
            subtitle="Version 1.0.0"
            onPress={() =>
              Alert.alert(
                "About LectureLens",
                "LectureLens is an AI-powered lecture annotation system designed to support university students with partial sensory challenges.\n\nVersion 1.0.0\n\nMalawi University of Business and Applied Sciences (MUBAS)"
              )
            }
          />

          <LogoutButton onPress={handleLogout} />
        </ScrollView>

        <NavBar fullBleed />
      </View>
    </ResponsiveScreen>
  );
}
