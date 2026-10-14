
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>LL</Text>
        </View>

        <Text style={styles.brand}>LectureLens</Text>

        <Text style={styles.heading}>
          Your lectures,{"\n"}made easier to follow.
        </Text>

        <Text style={styles.description}>
          Capture lecture information, organize your learning
          materials, and review your notes at your own pace.
        </Text>

        <View style={styles.featureList}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>01</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                Capture lecture information
              </Text>
              <Text style={styles.featureDescription}>
                Support your learning with lecture capture
                and transcription features.
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>02</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                Organize your modules
              </Text>
              <Text style={styles.featureDescription}>
                Keep your learning materials organized
                by your own courses and modules.
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>03</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>
                Review your notes
              </Text>
              <Text style={styles.featureDescription}>
                Return to lecture notes and references
                when you need them.
              </Text>
            </View>
          </View>
        </View>

        <Link href="/login" asChild>
          <Pressable
            style={styles.primaryButton}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              Get Started
            </Text>
          </Pressable>
        </Link>

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>
            New to LectureLens?
          </Text>

          <Link href="/register" asChild>
            <Pressable accessibilityRole="button">
              <Text style={styles.registerLink}>
                Create account
              </Text>
            </Pressable>
          </Link>
        </View>

        <Text style={styles.footer}>
          Designed to support accessible learning
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: "center",
  },
  logoContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoIcon: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: 1,
  },
  brand: {
    fontSize: 19,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 28,
  },
  heading: {
    width: "100%",
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: "#64748B",
    textAlign: "center",
    marginTop: 14,
    marginBottom: 28,
  },
  featureList: {
    width: "100%",
    gap: 20,
    marginBottom: 30,
  },
  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    fontWeight: "800",
    fontSize: 14,
    paddingTop: 12,
  },
  featureTextContainer: {
    flex: 1,
    paddingTop: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },
  primaryButton: {
    width: "100%",
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loginRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 20,
  },
  loginPrompt: {
    color: "#64748B",
    fontSize: 14,
  },
  registerLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 28,
  },
});
