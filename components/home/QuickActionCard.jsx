import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/homeStyles";

export default function QuickActionCard({

    icon,
    title,
    color="#2563EB",
    onPress,

}){

    return(

        <TouchableOpacity
            style={styles.actionCard}
            onPress={onPress}
        >

            <Ionicons
                name={icon}
                size={30}
                color={color}
            />
            <Text style={styles.actionTitle}>
                {title}
            </Text>
        </TouchableOpacity>

    );

}