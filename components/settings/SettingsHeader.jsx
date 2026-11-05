import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import styles from "../../styles/settingsStyles";

export default function SettingsHeader() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons
          name="arrow-back-outline"
          size={25}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <Text style={styles.title}>Settings</Text>
    </View>
  );
}
