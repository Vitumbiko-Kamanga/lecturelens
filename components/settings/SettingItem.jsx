import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/SettingsStyles";

export default function SettingItem({ icon, title, subtitle, onPress}) {

    return (

        <TouchableOpacity
            style={styles.row}
            onPress={onPress}
        >

            <View style={styles.left}>

                <Ionicons
                    name={icon}
                    size={24}
                    color="#2563EB"
                />

                <View style={styles.textContainer}>

                    <Text style={styles.itemTitle}>
                        {title}
                    </Text>

                    <Text style={styles.itemSubtitle}>
                        {subtitle}
                    </Text>

                </View>

            </View>

            <Ionicons
                name="chevron-forward"
                size={22}
                color="#999"
            />

        </TouchableOpacity>

    );

}