
import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

import QuickActionCard from "./QuickActionCard";
import styles from "../../styles/homeStyles";

export default function QuickActions() {
  const router = useRouter();

  return (
    <View>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionsGrid}>
        <QuickActionCard
          icon="mic"
          title="Record"
          color="#EF4444"
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
        />

        <QuickActionCard
          icon="sparkles"
          title="Ask AI"
          color="#8B5CF6"
        />
      </View>
    </View>
  );
}
