import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const BG = "#F5F7FB";
const MUTED = "#687589";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY} />

      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.appName}>LectureLens</Text>

          {/* Application icon centered below the name */}
          <View style={styles.logoCircle}>
            <Ionicons name="binoculars-outline" size={34} color={NAVY} />
          </View>

          <Text style={styles.headline}>
            Learn without{"\n"}
            <Text style={styles.goldText}>missing a moment.</Text>
          </Text>

          <Text style={styles.description}>
            Your lecture companion for capturing, organising and revisiting
            lecture information.
          </Text>
        </View>

        <View style={styles.features}>
          <Feature
            icon="mic-outline"
            title="Capture lectures"
            description="Record and keep lecture audio together."
          />
          <Feature
            icon="document-text-outline"
            title="Notes and transcripts"
            description="Review lecture text and add your own notes."
          />
          <Feature
            icon="library-outline"
            title="Organise your learning"
            description="Keep modules, lectures and resources in one place."
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/register")}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={19} color={NAVY} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.signInButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.signInLabel}>
              Already have an account? <Text style={styles.signInText}>Sign in</Text>
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Supporting accessible learning at MUBAS.</Text>
      </View>
    </SafeAreaView>
  );
}

function Feature({ icon, title, description }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={22} color={NAVY} />
      </View>
      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 18,
    paddingBottom: 14,
  },
  hero: {
    backgroundColor: NAVY,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 70,
    marginTop:-50,
    paddingBottom: 14,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  appName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  logoCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  headline: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
  },
  goldText: {
    color: GOLD,
  },
  description: {
    color: "#E3EAF3",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7,
    maxWidth: 480,
  },
  features: {
    paddingHorizontal: 18,
    paddingTop: 17,
    gap: 10,
  },
  featureRow: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EBF2",
    borderRadius: 13,
    paddingVertical: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#FFF3D8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    color: NAVY,
    fontSize: 13,
    fontWeight: "700",
  },
  featureDescription: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  actions: {
    paddingHorizontal: 18,
    marginTop: 17,
  },
  primaryButton: {
    minHeight: 48,
    backgroundColor: GOLD,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  primaryButtonText: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.78,
  },
  signInButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  signInLabel: {
    color: MUTED,
    fontSize: 12,
  },
  signInText: {
    color: NAVY,
    fontWeight: "800",
  },
  footer: {
    color: MUTED,
    fontSize: 10,
    textAlign: "center",
    paddingHorizontal: 12,
    marginTop: 11,
  },
});

