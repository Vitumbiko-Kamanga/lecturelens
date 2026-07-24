import React from "react";
import { ScrollView, View } from "react-native";

import NavBar from "../components/navbar";
import HomeHeader from "../components/home/HomeHeader";
import SearchBar from "../components/home/SearchBar";
import QuickActions from "../components/home/QuickActions";
import RecentLectures from "../components/home/RecentLectures";
import FloatingRecordButton from "../components/home/FloatingRecordButton";

import styles from "../styles/homeStyles";

export default function Home() {

    return (
        <View style={{flex:1}}>

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={true}
            >

                <HomeHeader userName="Vitumbiko" />
                <SearchBar />
                <QuickActions />
                <RecentLectures />
            </ScrollView>

            <FloatingRecordButton />
            <NavBar />

        </View>

    );

}