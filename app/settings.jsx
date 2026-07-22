import React from "react";
import { ScrollView } from "react-native";

import styles from "../styles/settingsStyles";

import SettingsHeader from "../components/settings/SettingsHeader";
import ProfileCard from "../components/settings/ProfileCard";
import SectionTitle from "../components/settings/SectionTitle";

export default function Settings() {

    return (

        <ScrollView style={styles.container}>

            <SettingsHeader />

            <ProfileCard
                name="Vitumbiko Kamanga"
                email="vitumbiko@example.com"
            />

            <SectionTitle
                title="ACCOUNT"
            />

        </ScrollView>

    );

}