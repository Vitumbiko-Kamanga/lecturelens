import React from "react";
import {useState} from "react";
import { ScrollView, View, Alert } from "react-native";
import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";

import styles from "../styles/settingsStyles";
 
import NavBar from "../components/navbar";
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
    async function handleLogout() {
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
    }

    return (
        <View style={styles.main}>
            <SettingsHeader />
            <ScrollView style={styles.container}>

                <ProfileCard />

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
                    onPress={() => console.log("Security")}
                />
                <SettingItem
                    icon="cloud-outline"
                    title="Backup & Sync"
                    subtitle="Manage cloud backup"
                    onPress={() => console.log("Backup")}
                />

                <SectionTitle title="PREFERENCES" />
                <SettingSwitch
                    icon="notifications-outline"
                    title="Notifications"
                    subtitle="Manage notifications"
                    value={notifications}
                    onValueChange={setNotifications}
                />
                <SettingItem
                    icon="color-palette-outline"
                    title="Appearance"
                    subtitle="Light Theme"
                />
                <SettingItem
                    icon="language-outline"
                    title="Language"
                    subtitle="English"
                />
                <SettingSwitch
                    icon="download-outline"
                    title="Offline Mode"
                    subtitle="Download notes"
                    value={offline}
                    onValueChange={setOffline}
                />

                <SectionTitle title="SUPPORT" />
                <SettingItem
                    icon="help-circle-outline"
                    title="Help & FAQ"
                    subtitle="Find answers"
                    onPress={() => console.log("Backup")}
                />
                <SettingItem
                    icon="chatbubble-outline"
                    title="Contact Us"
                    subtitle="We're here to help"
                    onPress={() => console.log("Backup")}
                />
                <SettingItem
                    icon="information-circle-outline"
                    title="About LectureLens"
                    subtitle="Version 1.0.0"
                    onPress={() => console.log("Backup")}
                />
                <LogoutButton onPress={handleLogout} />
            </ScrollView>
            
            <NavBar />
        </View>

    );

}