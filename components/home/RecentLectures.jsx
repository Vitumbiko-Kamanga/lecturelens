
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { api } from "../../services/api";
import LectureCard from "./LectureCard";
import styles from "../../styles/homeStyles";

function getItems(result, key) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.[key])) {
    return result[key];
  }

  return [];
}

function formatLectureDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const sameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString();
}

function getLectureTimestamp(lecture) {
  const value =
    lecture.lecture_date || lecture.created_at;

  if (!value) return 0;

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default function RecentLectures() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRecentLectures() {
        try {
          setLoading(true);
          setError("");

          const modulesResult = await api.listModules();
          const modules = getItems(modulesResult, "modules");

          const lectureGroups = await Promise.all(
            modules.map(async (module) => {
              const result = await api.listLectures(module.id);
              const moduleLectures = getItems(
                result,
                "lectures"
              );

              return moduleLectures.map((lecture) => ({
                ...lecture,
                moduleName: module.name,
              }));
            })
          );

          const latestLectures = lectureGroups
            .flat()
            .sort(
              (a, b) =>
                getLectureTimestamp(b) -
                getLectureTimestamp(a)
            )
            .slice(0, 3);

          if (active) {
            setLectures(latestLectures);
          }
        } catch (err) {
          if (active) {
            setLectures([]);
            setError(
              err?.message ||
                "Could not load recent lectures. Please try again."
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadRecentLectures();

      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.sectionTitle}>
        Recent Lectures
      </Text>

      {loading && (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator
            size="small"
            color="#12325B"
          />
          <Text
            style={{
              textAlign: "center",
              marginTop: 8,
              color: "#64748B",
            }}
          >
            Loading your lectures...
          </Text>
        </View>
      )}

      {!loading && !!error && (
        <Text
          style={{
            color: "#DC2626",
            marginVertical: 12,
          }}
        >
          {error}
        </Text>
      )}

      {!loading && !error && lectures.length === 0 && (
        <Text
          style={{
            color: "#64748B",
            marginVertical: 12,
          }}
        >
          No lectures yet. Create a module and add your
          first lecture to see it here.
        </Text>
      )}

      {!loading &&
        !error &&
        lectures.map((lecture, index) => (
          <LectureCard
            key={
              lecture.id ??
              `${lecture.module_id ?? "module"}-${index}`
            }
            title={lecture.title || "Untitled lecture"}
            date={formatLectureDate(
              lecture.lecture_date || lecture.created_at
            )}
            status={lecture.topic || "Lecture saved"}
            color="#12325B"
          />
        ))}
    </View>
  );
}
