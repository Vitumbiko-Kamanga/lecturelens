import React, { useCallback, useRef } from "react";
import { View, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

import HomeHeader from "../components/home/HomeHeader";
import SearchBar from "../components/home/SearchBar";
import FloatingRecordButton from "../components/home/FloatingRecordButton";
import NavBar from "../components/navbar";
import ResponsiveScreen from "../components/common/ResponsiveScreen";

import NotesStats from "../components/notes/NotesStats";
import ModulesSection from "../components/notes/ModulesSection";

import styles from "../styles/notesStyles";

export default function Notes() {
  const params = useLocalSearchParams();
  const scrollRef = useRef(null);

  const moduleId = Array.isArray(params.moduleId)
    ? params.moduleId[0]
    : params.moduleId;

  const lectureId = Array.isArray(params.lectureId)
    ? params.lectureId[0]
    : params.lectureId;

  const handleSelectedLectureChange = useCallback((selection) => {
    if (!selection) return;

    // Wait for the selected lecture details to render before scrolling.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    });
  }, []);

  return (
    <ResponsiveScreen>
    <View style={styles.main}>
      <HomeHeader userName="Vitumbiko" />

      <ScrollView
        ref={scrollRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <SearchBar />

        <NotesStats />

        <ModulesSection
          initialModuleId={moduleId}
          initialLectureId={lectureId}
          onSelectedLectureChange={handleSelectedLectureChange}
        />
      </ScrollView>

      <FloatingRecordButton />

      <NavBar />
    </View>
    </ResponsiveScreen>
  );
}
