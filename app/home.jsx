
import React from "react";
import { useRouter } from "expo-router";
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { useUser } from "@clerk/expo";

import NavBar from "../components/navbar";
import HomeHeader from "../components/home/HomeHeader";
import SearchBar from "../components/home/SearchBar";
import QuickActions from "../components/home/QuickActions";
import RecentLectures from "../components/home/RecentLectures";
import FloatingRecordButton from "../components/home/FloatingRecordButton";

import styles from "../styles/homeStyles";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const userName = isLoaded
    ? user?.firstName || user?.username || "Student"
    : "Student";

  return (
    <View style={styles.main}>
      <HomeHeader userName={userName} />

      <TouchableOpacity
        onPress={() => router.push("/modules")}
        style={{
          backgroundColor: "#12325B",
          padding: 15,
          borderRadius: 12,
          marginHorizontal: 16,
          marginVertical: 12,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          + Manage Modules & Lectures
        </Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={true}
      >
        <SearchBar />
        <QuickActions />
        <RecentLectures />
      </ScrollView>

      <FloatingRecordButton />
      <NavBar />
    </View>
  );
}
