import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/settingsStyles";

export default function SettingSwitch({

    icon,
    title,
    subtitle,
    value,
    onValueChange,

}) {

    return (

        <TouchableOpacity
            activeOpacity={1}
            style={styles.row}
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

            <Switch
                value={value}
                onValueChange={onValueChange}
            />

        </TouchableOpacity>

    );

}