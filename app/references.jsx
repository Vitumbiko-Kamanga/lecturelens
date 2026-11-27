import React from "react";
import { ScrollView, View } from "react-native";

import HomeHeader from "../components/home/HomeHeader";
import NavBar from "../components/navbar";
import ResponsiveScreen from "../components/common/ResponsiveScreen";
import FloatingRecordButton from "../components/home/FloatingRecordButton";

import SearchReference from "../components/references/SearchReference";
import ModuleList from "../components/references/ModuleList";
import ReferenceCategoryList from "../components/references/ReferenceCategoryList";

import styles from "../styles/referencesStyles";

export default function Reference() {
  return (
    <ResponsiveScreen
      scroll={false}
      contentStyle={{ paddingHorizontal: 0 }}
    >
      <View style={styles.main}>
        <HomeHeader />

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 160,
          }}
        >
          <SearchReference />

          <ModuleList />

          <ReferenceCategoryList />
        </ScrollView>

        <FloatingRecordButton />

        <NavBar fullBleed />
      </View>
    </ResponsiveScreen>
  );
}
