import React from "react";
import {useState} from "react";
import { ScrollView } from "react-native";

import styles from "../styles/settingsStyles";

import SettingsHeader from "../components/settings/SettingsHeader";
import ProfileCard from "../components/settings/ProfileCard";
import SectionTitle from "../components/settings/SectionTitle";
import SettingItem from "../components/settings/SettingItem";
import LogoutButton from "../components/settings/LogoutButton";
import SettingSwitch from "../components/settings/SettingSwitch";

export default function Settings() {

    const [notifications, setNotifications] = useState(true);
    const [offline, setOffline] = useState(false);

    return (

        <ScrollView style={styles.container}>

            <SettingsHeader />

            <ProfileCard
                name="Vitumbiko Kamanga"
                email="bit22-vkamanga@mubas.ac.mw"
            />

            <SectionTitle title="ACCOUNT" />
            <SettingItem
                icon="person-outline"
                title="Profile Information"
                subtitle="View and edit your profile"
                onPress={() => console.log("Profile")}
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

            

            <LogoutButton 
              onPress={() => console.log("Logout")}
            />

        </ScrollView>

    );

}