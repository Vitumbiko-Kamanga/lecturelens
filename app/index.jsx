import React from "react";
import { ScrollView } from "react-native";

import NavBar from "../components/navbar";
import HomeHeader from "../components/home/HomeHeader";
import SearchBar from "../components/home/SearchBar";

import styles from "../styles/homeStyles";

export default function Home() {

    return (

        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >

            <HomeHeader userName="Vitumbiko" />
            <SearchBar />

            {/* <NavBar /> */}

        </ScrollView>

    );

}