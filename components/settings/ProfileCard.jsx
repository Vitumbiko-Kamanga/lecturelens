import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";

import styles from "../../styles/settingsStyles";

export default function ProfileCard({ onPress }) {
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

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "S";

  return (
    <TouchableOpacity
      style={styles.profileCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.name}>{initial}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#98A2B3"
      />
    </TouchableOpacity>
  );
}
