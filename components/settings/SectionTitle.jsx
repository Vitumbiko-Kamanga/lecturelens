import React from "react";
import { Text } from "react-native";

import styles from "../../styles/settingsStyles";

export default function SectionTitle({ title }) {

    return (

        <Text style={styles.section}>
            {title}
        </Text>

    );

}