
import React from "react";
import { View, ScrollView, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

import HomeHeader from "../components/home/HomeHeader";
import SearchBar from "../components/home/SearchBar";
import FloatingRecordButton from "../components/home/FloatingRecordButton";
import NavBar from "../components/navbar";

import NotesStats from "../components/notes/NotesStats";
import ModulesSection from "../components/notes/ModulesSection";

import styles from "../styles/notesStyles";

export default function Notes() {
  const params = useLocalSearchParams();

  const moduleId = Array.isArray(params.moduleId)
    ? params.moduleId[0]
    : params.moduleId;

  const lectureId = Array.isArray(params.lectureId)
    ? params.lectureId[0]
    : params.lectureId;

  const hasSelectedLecture =
    moduleId != null && lectureId != null;

  return (
    <View style={styles.main}>
      <HomeHeader userName="Vitumbiko" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {hasSelectedLecture && (
          <View
            style={{
              backgroundColor: "#FFF9E9",
              borderColor: "#F2B544",
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: "#12325B",
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              Notes for the selected lecture
            </Text>

            <Text
              style={{
                color: "#667085",
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Loading the selected module and lecture...
            </Text>
          </View>
        )}

        <SearchBar />

        <NotesStats />

        <ModulesSection
          initialModuleId={moduleId}
          initialLectureId={lectureId}
        />
      </ScrollView>

      <FloatingRecordButton />

      <NavBar />
    </View>
  );
}
