import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/referencesStyles";

export default function ModuleFolder({title}){

    return(

        <TouchableOpacity style={styles.itemCard}>

            <View style={styles.left}>

                <Ionicons
                    name="folder"
                    size={28}
                    color="#FFB000"
                />

                <Text style={styles.itemTitle}>
                    {title}
                </Text>

            </View>

            <Ionicons
                name="chevron-forward"
                size={22}
                color="#9CA3AF"
            />

        </TouchableOpacity>

    );

}