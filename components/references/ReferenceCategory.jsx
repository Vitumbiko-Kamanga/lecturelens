import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../styles/referencesStyles";

const NAVY = "#12325B";
const GOLD = "#F2B544";

export default function ReferenceCategory({
  icon,
  title,
  onPress,
  disabled = false,
}) {
  return (
    <TouchableOpacity
      style={[styles.itemCard, disabled && localStyles.disabledCard]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={localStyles.left}>
        <View style={localStyles.iconContainer}>
          <Ionicons name={icon} size={23} color={NAVY} />
        </View>

        <View style={localStyles.textContainer}>
          <Text style={styles.itemTitle}>{title}</Text>

          {disabled && (
            <Text style={localStyles.comingSoon}>
              Coming soon
            </Text>
          )}
        </View>
      </View>

      {!disabled && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#98A2B3"
        />
      )}
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFF6E0",
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  disabledCard: {
    opacity: 0.6,
  },

  comingSoon: {
    fontSize: 12,
    color: "#7A8493",
    marginTop: 3,
  },
});