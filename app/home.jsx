import React from "react";
import {
  ScrollView,
  View,
} from "react-native";
import { useUser } from "@clerk/expo";

import NavBar from "../components/navbar";
import HomeHeader from "../components/home/HomeHeader";
import SearchBar from "../components/home/SearchBar";
import QuickActions from "../components/home/QuickActions";
import RecentLectures from "../components/home/RecentLectures";
import FloatingRecordButton from "../components/home/FloatingRecordButton";
import ResponsiveScreen from "../components/common/ResponsiveScreen";

import styles from "../styles/homeStyles";

export default function Home() {
  const { user, isLoaded } = useUser();

  const userName = isLoaded
    ? user?.firstName || user?.username || "Student"
    : "Student";

  return (
    <ResponsiveScreen
      scroll={false}
      contentStyle={{ paddingHorizontal: 0 }}
    >
      <View style={styles.main}>
        <HomeHeader userName={userName} />

        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
        >
          <SearchBar />
          <QuickActions />
          <RecentLectures />
        </ScrollView>

        <FloatingRecordButton />
        <NavBar fullBleed />
      </View>
    </ResponsiveScreen>
  );
}
