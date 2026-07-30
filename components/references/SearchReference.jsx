import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/referencesStyles";

export default function SearchReference(){

    return(

        <View style={styles.searchBar}>

            <Ionicons
                name="search"
                size={22}
                color="#9CA3AF"
            />

            <TextInput
                placeholder="Search references..."
                style={styles.searchInput}
            />

        </View>

    );

}