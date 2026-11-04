import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import styles from "../../styles/referencesStyles";

export default function ModuleFolder({ moduleId, title }) {
  const handlePress = () => {
    router.push({
      pathname: "/module-references/[moduleId]",
      params: {
        moduleId: String(moduleId),
        moduleName: title,
      },
    });
  };

  return (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Ionicons
          name="folder"
          size={28}
          color="#F2B544"
        />

        <Text style={styles.itemTitle}>{title}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#9CA3AF"
      />
    </TouchableOpacity>
  );
}