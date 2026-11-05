import React from "react";
import {
  View,
  Text,
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
    <View style={styles.row}>
      <View style={styles.left}>
        <Ionicons
          name={icon}
          size={24}
          color="#12325B"
        />

        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{title}</Text>

          {!!subtitle && (
            <Text style={styles.itemSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "#D0D5DD",
          true: "#F2B544",
        }}
        thumbColor={value ? "#12325B" : "#F4F4F4"}
      />
    </View>
  );
}
