import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/referencesStyles";

export default function FeaturedResource(){

    return(

        <TouchableOpacity style={styles.featureCard}>

            <View>

                <Text style={styles.featureLabel}>
                    Featured Resource
                </Text>

                <Text style={styles.featureTitle}>
                    Operating System Concepts
                </Text>

                <Text style={styles.featureSubtitle}>
                    Book Recommended for you
                </Text>

            </View>

            <Ionicons
                name="chevron-forward"
                size={26}
                color="#2563EB"
            />

        </TouchableOpacity>

    );

}