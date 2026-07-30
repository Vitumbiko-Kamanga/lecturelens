import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/referencesStyles";

export default function ReferenceCategory({icon,title}){

    return(

        <TouchableOpacity style={styles.itemCard}>

            <View style={styles.left}>

                <Ionicons
                    name={icon}
                    size={26}
                    color="#2563EB"
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