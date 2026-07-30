import React from "react";
import { ScrollView, View } from "react-native";

import HomeHeader from "../components/home/HomeHeader";
import NavBar from "../components/navbar";
import FloatingRecordButton from "../components/home/FloatingRecordButton";

import SearchReference from "../components/references/SearchReference";
import FeaturedResource from "../components/references/FeaturedResource";
import ModuleList from "../components/references/ModuleList";
import ReferenceCategoryList from "../components/references/ReferenceCategoryList";

import styles from "../styles/referencesStyles";

export default function Reference() {

    return (

        <View style={styles.main}>

            <HomeHeader userName="Yashar" />

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >

                <SearchReference />

                <FeaturedResource />

                <ModuleList />

                <ReferenceCategoryList />

            </ScrollView>

            <FloatingRecordButton />

            <NavBar />

        </View>

    );

}