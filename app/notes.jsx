import React from "react";
import { View, ScrollView } from "react-native";

import HomeHeader from "../components/home/HomeHeader";
import SearchBar from "../components/home/SearchBar";
import FloatingRecordButton from "../components/home/FloatingRecordButton";
import NavBar from "../components/navbar";

import NotesStats from "../components/notes/NotesStats";
import ModulesSection from "../components/notes/ModulesSection";

import styles from "../styles/notesStyles";

export default function Notes() {

    return (

        <View style={styles.main}>

            <HomeHeader userName="Vitumbiko" />

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >

                <SearchBar />

                <NotesStats />

                <ModulesSection />

            </ScrollView>

            <FloatingRecordButton />

            <NavBar />

        </View>

    );

}