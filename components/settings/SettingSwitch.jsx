import React from "react";
import { View, Text, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/SettingsStyles";

export default function SettingSwitch({

    icon,
    title,
    subtitle,
    value,
    onValueChange

}) {

    return (

        <View style={styles.row}>

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

        </View>

    );

}