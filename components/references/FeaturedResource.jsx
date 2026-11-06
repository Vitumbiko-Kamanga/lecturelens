
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/referencesStyles";

const NAVY = "#12325B";
const GOLD = "#F2B544";

export default function FeaturedResource() {
  return (
    <TouchableOpacity
      style={styles.featureCard}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Featured resource: Operating System Concepts"
    >
      <View style={localStyles.content}>
        <View style={localStyles.labelRow}>
          <Ionicons
            name="book-outline"
            size={17}
            color={NAVY}
          />

          <Text style={styles.featureLabel}>
            FEATURED RESOURCE
          </Text>
        </View>

        <Text style={styles.featureTitle}>
          Operating System Concepts
        </Text>

        <Text style={styles.featureSubtitle}>
          Recommended reading for your studies
        </Text>
      </View>

      <View style={localStyles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={22}
          color={NAVY}
        />
      </View>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  content: {
    flex: 1,
    marginRight: 12,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  arrowContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFF6E0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: GOLD,
  },
});
