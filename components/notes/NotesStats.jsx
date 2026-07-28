import React from "react";
import { View, Text } from "react-native";

import styles from "../../styles/notesStyles";

export default function NotesStats(){

    return(

        <View>

            <Text style={styles.sectionTitle}>
                Modules Overview
            </Text>

            <View style={styles.statsContainer}>

                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>6</Text>
                    <Text style={styles.statLabel}>Modules</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>48</Text>
                    <Text style={styles.statLabel}>Notes</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>12</Text>
                    <Text style={styles.statLabel}>Favorites</Text>
                </View>

            </View>

        </View>

    )

}