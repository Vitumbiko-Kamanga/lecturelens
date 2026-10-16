
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";

import styles from "../../styles/settingsStyles";

export default function ProfileCard() {
    const { user, isLoaded } = useUser();

    const name = isLoaded
        ? user?.fullName ||
          user?.firstName ||
          user?.username ||
          "Student"
        : "Loading profile...";

    const email = isLoaded
        ? user?.primaryEmailAddress?.emailAddress ||
          "No email address available"
        : "Loading email...";

    return (
        <TouchableOpacity
            style={styles.profileCard}
            activeOpacity={0.8}
        >
            <View style={styles.avatar}>
                <Ionicons
                    name="person"
                    size={32}
                    color="#2563EB"
                />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.email}>{email}</Text>
            </View>

            <Ionicons
                name="chevron-forward"
                size={22}
                color="#999"
            />
        </TouchableOpacity>
    );
}
