
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
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
}) {
  const router = useRouter();

  function handleSummary() {
    Alert.alert(
      "Lecture Summary",
      "Summary generation is not implemented yet. It will be connected when the summarization feature is available."
    );
  }

  function handleNotes() {
    router.push("/notes");
  }

  return (
    <View style={styles.lectureCard}>
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
