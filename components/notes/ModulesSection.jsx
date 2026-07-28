import React from "react";
import { View, Text } from "react-native";

import ModuleCard from "./ModuleCard";

import styles from "../../styles/notesStyles";

export default function ModulesSection(){

    return(

        <View>

            <Text style={styles.sectionTitle}>
                My Modules
            </Text>

            <ModuleCard
                title="Database Management Systems"
                notes="12 Lecture Notes"
                updated="Updated Today"
                color="#4F46E5"
            />

            <ModuleCard
                title="Operating Systems"
                notes="8 Lecture Notes"
                updated="Updated Yesterday"
                color="#059669"
            />

            <ModuleCard
                title="Computer Hardware"
                notes="6 Lecture Notes"
                updated="Updated Monday"
                color="#EA580C"
            />

            <ModuleCard
                title="Telecommunications"
                notes="15 Lecture Notes"
                updated="Updated Today"
                color="#7C3AED"
            />

            <ModuleCard
                title="Research Methods"
                notes="4 Lecture Notes"
                updated="Updated Last Week"
                color="#2563EB"
            />

            <ModuleCard
                title="Web Technologies"
                notes="10 Lecture Notes"
                updated="Updated Yesterday"
                color="#0EA5E9"
            />

        </View>

    )

}