
import React from "react";
import {
  View,
  Text,
  Alert,
} from "react-native";

import { useRouter } from "expo-router";

import QuickActionCard from "./QuickActionCard";
import styles from "../../styles/homeStyles";

export default function QuickActions() {
  const router = useRouter();

  const showComingSoon = (feature) => {
    Alert.alert(
      feature,
      `${feature} is planned for a future LectureLens update.`
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.actionsGrid}>
        <QuickActionCard
          icon="folder-open"
          title="Manage Modules"
          color="#12325B"
          onPress={() => router.push("/modules")}
        />

        <QuickActionCard
          icon="document-text"
          title="My Notes"
          color="#2563EB"
          onPress={() => router.push("/notes")}
        />

        <QuickActionCard
          icon="reader"
          title="Summaries"
          color="#10B981"
          onPress={() => showComingSoon("Summaries")}
        />

        <QuickActionCard
          icon="sparkles"
          title="Ask AI"
          color="#8B5CF6"
          onPress={() => showComingSoon("Ask AI")}
        />
      </View>
    </View>
  );
}
