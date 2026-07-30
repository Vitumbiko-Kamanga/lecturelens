import React from "react";
import { View, Text } from "react-native";

import ModuleFolder from "./ModuleFolder";

import styles from "../../styles/referencesStyles";

export default function ModuleList(){

    return(

        <View>

            <Text style={styles.sectionTitle}>
                Browse by Module
            </Text>

            <ModuleFolder title="Database Systems"/>

            <ModuleFolder title="Operating Systems"/>

            <ModuleFolder title="Telecommunications"/>

            <ModuleFolder title="Web Technologies"/>

            <ModuleFolder title="Computer Hardware"/>

            <ModuleFolder title="Research Methods"/>

        </View>

    );

}