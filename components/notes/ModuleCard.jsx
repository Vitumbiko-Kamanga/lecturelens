import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/notesStyles";

export default function ModuleCard({

    title,
    notes,
    updated,
    color

}){

    return(

        <TouchableOpacity style={styles.moduleCard}>

            <View style={styles.leftSection}>

                <View
                    style={[
                        styles.folderIcon,
                        // { backgroundColor: color }
                    ]}
                >

                    <Ionicons
                        name="folder"
                        size={44}
                        color="#7e7b79"
                    />

                </View>

                <View>

                    <Text style={styles.moduleTitle}>
                        {title}
                    </Text>

                    <Text style={styles.moduleNotes}>
                        {notes}
                    </Text>

                    <Text style={styles.moduleUpdated}>
                        {updated}
                    </Text>

                </View>

            </View>

            <Ionicons
                name="chevron-forward"
                size={24}
                color="#9CA3AF"
            />

        </TouchableOpacity>

    )

}