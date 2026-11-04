import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/homeStyles";

export default function HomeHeader({ userName }) {
  const initial = userName?.trim()?.[0]?.toUpperCase() || "S";

  return (
    <View style={styles.header}>
      {/* Logged-in user's initial */}
      <View style={styles.usernameContainer}>
        <Text style={styles.userName}>{initial}</Text>
      </View>

      {/* LectureLens icon */}
      <Ionicons
        name="binoculars-outline"
        size={28}
        color="#FFFFFF"
      />

      {/* Menu icon */}
      <Ionicons
        name="menu-outline"
        size={28}
        color="#FFFFFF"
      />
    </View>
  );
}