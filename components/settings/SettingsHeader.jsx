import React from "react";
import { View, Text } from "react-native";

import styles from "../../styles/settingsStyles";

export default function SettingsHeader() {

    return (

        <View style={styles.header}>

            <Text style={styles.title}>
                Settings
            </Text>

            <Text style={styles.subtitle}>
                Manage your preferences
            </Text>

        </View>

    );

}