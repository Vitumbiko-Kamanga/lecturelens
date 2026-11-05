import React, { useState } from "react";
import { useSignIn } from "@clerk/expo";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (fetchStatus === "fetching") {
      return;
    }

    setIsLoading(true);

    try {
      const { error: createError } = await signIn.create({
        identifier: cleanEmail,
      });

      if (createError) {
        setError(createError.message || "Unable to start sign-in.");
        return;
      }

      const { error: passwordError } = await signIn.password({
        password,
      });

      if (passwordError) {
        setError(passwordError.message || "Unable to sign in.");
        return;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();

        if (finalizeError) {
          setError(finalizeError.message || "Could not complete sign-in.");
        }
      } else {
        setError(
          "Additional verification is required. Please contact support while we configure this step."
        );
      }
    } catch (error) {
      setError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.replace("/")}
              accessibilityRole="button"
              accessibilityLabel="Back to welcome screen"
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.white} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <View style={styles.logoContainer}>
              <Ionicons
                name="binoculars-outline"
                size={37}
                color={COLORS.navy}
              />
            </View>

            <Text style={styles.brand}>LectureLens</Text>
            <Text style={styles.topCaption}>Your learning, all in focus.</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your learning journey.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your university email"
                  placeholderTextColor={COLORS.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  accessibilityLabel="Email address"
                  returnKeyType="next"
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  accessibilityLabel="Password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable
                  onPress={() => setShowPassword((previous) => !previous)}
                  style={styles.passwordToggle}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.navy}
                  />
                </Pressable>
              </View>

              {error ? (
                <Text
                  style={styles.error}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                >
                  {error}
                </Text>
              ) : null}

              <Pressable
                style={[
                  styles.primaryButton,
                  (isLoading || fetchStatus === "fetching") && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading || fetchStatus === "fetching"}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Text>
                {!isLoading && (
                  <Ionicons name="arrow-forward" size={20} color={COLORS.navy} />
                )}
              </Pressable>

              <View style={styles.registerRow}>
                <Text style={styles.registerPrompt}>Don't have an account?</Text>
                <Link href="/register" asChild>
                  <Pressable accessibilityRole="button">
                    <Text style={styles.registerLink}>Create account</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>

          <Text style={styles.footer}>Supporting accessible learning at MUBAS.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const COLORS = {
  navy: "#12325B",
  navyDark: "#0D2545",
  gold: "#F2B544",
  white: "#FFFFFF",
  background: "#F7F9FC",
  text: "#172B45",
  muted: "#718096",
  placeholder: "#9AA8B8",
  border: "#DCE3EC",
  error: "#B42318",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  topSection: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 27,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 24,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 2,
  },
  logoContainer: {
    width: 66,
    height: 66,
    borderRadius: 21,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  brand: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  topCaption: {
    color: "#DCE7F4",
    fontSize: 13,
    marginTop: 5,
  },
  formSection: {
    paddingHorizontal: 25,
    paddingTop: 27,
  },
  heading: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 7,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 23,
  },
  form: {
    width: "100%",
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 13,
    paddingHorizontal: 13,
    marginBottom: 17,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  passwordToggle: {
    padding: 5,
    marginLeft: 5,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -5,
    marginBottom: 13,
  },
  primaryButton: {
    minHeight: 54,
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.navyDark,
    fontSize: 16,
    fontWeight: "800",
  },
  registerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 22,
  },
  registerPrompt: {
    color: COLORS.muted,
    fontSize: 13,
  },
  registerLink: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: "800",
  },
  footer: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 22,
    paddingHorizontal: 20,
  },
});
