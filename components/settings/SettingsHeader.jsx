import React from "react";
import { View, Text } from "react-native";

import styles from "../../styles/settingsStyles";
import {Ionicons} from "@expo/vector-icons";

export default function SettingsHeader() {

    return (

        <View style={styles.header}>
            <Ionicons 
                name="arrow-back-outline"
                size={30}
                color="#777"
                weight=""

            />
            <Text style={styles.title}>
                Settings
            </Text>
            {/* <Text style={styles.subtitle}>
                Manage your preferences
            </Text> */}

        </View>

    );

}