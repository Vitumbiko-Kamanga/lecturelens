
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Link, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const MUTED = "#98A2B3";

export default function NavLink({ title, name, href }) {
  const pathname = usePathname();

  const isActive =
    pathname === href ||
    (href === "/home" && pathname === "/");

  const iconColor = isActive ? NAVY : MUTED;
  const textColor = isActive ? NAVY : MUTED;

  return (
    <Link href={href} asChild>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View style={styles.link}>
          {isActive && (
            <View style={styles.activeIndicator} />
          )}

          <Ionicons
            name={name}
            size={25}
            color={iconColor}
          />

          <Text
            style={[
              styles.dashItem,
              { color: textColor },
              isActive && styles.activeText,
            ]}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },

  link: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 55,
  },

  activeIndicator: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginBottom: 6,
  },

  dashItem: {
    fontSize: 12,
    paddingTop: 5,
    fontWeight: "500",
  },

  activeText: {
    fontWeight: "700",
  },
});
