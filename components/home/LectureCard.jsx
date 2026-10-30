
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/homeStyles";

export default function LectureCard({
  title,
  date,
  status,
  color = "#12325B",
  moduleId,
  lectureId,
}) {
  const router = useRouter();

  function handleOpenLecture() {
    if (moduleId == null || lectureId == null) {
      Alert.alert(
        "Lecture unavailable",
        "The module or lecture ID is missing. Please open it from Manage Modules."
      );
      return;
    }

    router.push({
      pathname: "/modules",
      params: {
        moduleId: String(moduleId),
        lectureId: String(lectureId),
      },
    });
  }

  function handleSummary() {
    Alert.alert(
      "Lecture Summary",
      "Summary generation is not implemented yet. It will be connected when the summarization feature is available."
    );
  }

  function handleNotes() {
    if (moduleId == null || lectureId == null) {
        Alert.alert(
        "Notes unavailable",
        "The module or lecture information is missing."
        );
        return;
    }

    router.push({
        pathname: "/notes",
        params: {
        moduleId: String(moduleId),
        lectureId: String(lectureId),
        },
    });
   }

  return (
    <View style={styles.lectureCard}>
      <Pressable
        onPress={handleOpenLecture}
        accessibilityRole="button"
        accessibilityLabel={`Open ${title}`}
        accessibilityHint="Opens the module containing this lecture"
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.lectureTitle}>
              {title}
            </Text>

            <Text style={styles.lectureDate}>
              {date}
            </Text>
          </View>

          <Ionicons
            name="book"
            size={26}
            color="#12325B"
          />
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: color },
          ]}
        >
          <Text style={styles.statusText}>
            {status}
          </Text>
        </View>

        <Text
          style={{
            color: "#64748B",
            fontSize: 12,
            marginTop: 8,
          }}
        >
          Tap to open this lecture
        </Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSummary}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Summary for ${title}`}
        >
          <Text style={styles.primaryButtonText}>
            Summary
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleNotes}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Notes for ${title}`}
        >
          <Text style={styles.secondaryButtonText}>
            Notes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
