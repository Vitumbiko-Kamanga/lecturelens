import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { api } from "../../services/api";
import styles from "../../styles/notesStyles";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const MUTED = "#667085";

function getItems(result, key) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.[key])) {
    return result[key];
  }

  return [];
}

export default function NotesStats() {
  const [stats, setStats] = useState({
    modules: 0,
    lectures: 0,
    notes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Load the authenticated student's modules.
      const modulesResult = await api.listModules();
      const modules = getItems(modulesResult, "modules");

      let totalLectures = 0;
      let totalNotes = 0;

      // Load lectures belonging to each module.
      const lectureResults = await Promise.all(
        modules.map((module) => api.listLectures(module.id))
      );

      const lecturesByModule = lectureResults.map((result) =>
        getItems(result, "lectures")
      );

      const allLectures = lecturesByModule.flat();

      totalLectures = allLectures.length;

      // Load notes belonging to each lecture.
      const noteResults = await Promise.all(
        allLectures.map((lecture) => api.listNotes(lecture.id))
      );

      totalNotes = noteResults.reduce((total, result) => {
        return total + getItems(result, "notes").length;
      }, 0);

      setStats({
        modules: modules.length,
        lectures: totalLectures,
        notes: totalNotes,
      });
    } catch (err) {
      setError(
        err.message || "Could not load your Notes statistics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh the statistics whenever the Notes screen becomes active.
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const statItems = [
    {
      label: "Modules",
      value: stats.modules,
    },
    {
      label: "Lectures",
      value: stats.lectures,
    },
    {
      label: "Notes",
      value: stats.notes,
    },
  ];

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Modules Overview
      </Text>

      <View style={styles.statsContainer}>
        {statItems.map((item) => (
          <View key={item.label} style={styles.statCard}>
            {loading ? (
              <ActivityIndicator color={NAVY} />
            ) : (
              <Text style={styles.statNumber}>
                {item.value}
              </Text>
            )}

            <Text style={styles.statLabel}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {error !== "" && (
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: "#B42318", fontSize: 13 }}>
            {error}
          </Text>

          <TouchableOpacity
            onPress={loadStats}
            disabled={loading}
            style={{
              alignSelf: "flex-start",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: GOLD,
              borderRadius: 8,
              marginTop: 8,
              backgroundColor: "#FFF9E9",
            }}
          >
            <Text style={{ color: NAVY, fontWeight: "700" }}>
              Retry loading statistics
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
