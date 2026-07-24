import React from "react";
import { View, Text } from "react-native";

import QuickActionCard from "./QuickActionCard";

import styles from "../../styles/homeStyles";

export default function QuickActions(){

    return(

        <View>

            <Text style={styles.sectionTitle}> Quick Actions </Text>

            <View style={styles.actionsGrid}>
                <QuickActionCard
                    icon="mic"
                    title="Record"
                />

                <QuickActionCard
                    icon="document-text"
                    title="My Notes"
                />

                <QuickActionCard
                    icon="reader"
                    title="Summaries"
                />

                <QuickActionCard
                    icon="sparkles"
                    title="Ask AI"
                />

            </View>

        </View>

    );

}