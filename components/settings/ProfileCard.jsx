import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/settingsStyles";

export default function ProfileCard() {

    return (

        <TouchableOpacity style={styles.profileCard}>

            {/* Avatar */}

            <View style={styles.avatar}>

                <Ionicons
                    name="person"
                    size={38}
                    color="#2563EB"
                />

            </View>

            {/* User Information */}

            <View style={{ flex: 1 }}>

                <Text style={styles.name}>
                    Vitumbiko Kamanga
                </Text>

                <Text style={styles.email}>
                    bit22-vkamanga@mubas.ac.mw
                </Text>

            </View>

            {/* Arrow Icon*/}

            <Ionicons
                name="chevron-forward"
                size={24}
                color="#999"
            />

        </TouchableOpacity>

    );

}