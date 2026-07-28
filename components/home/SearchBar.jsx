import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/homeStyles";

export default function SearchBar() {

    return (

        <View style={styles.searchSection}>

            <Ionicons
                name="search"
                size={22}
                color="#9CA3AF"
            />

            <TextInput
                style={styles.searchInput}
                placeholder="Search module, notes..."
                placeholderTextColor="#9CA3AF"
            />

        </View>

    );

}