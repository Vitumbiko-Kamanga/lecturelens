
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
} from "react-native";
import { Link, router } from "expo-router";

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
    // Step 1: Start sign-in with the student's email.
    const { error: createError } = await signIn.create({
      identifier: cleanEmail,
    });

    if (createError) {
      setError(createError.message || "Unable to start sign-in.");
      return;
    }

    // Step 2: Verify the password.
    const { error: passwordError } = await signIn.password({
      password,
    });

    if (passwordError) {
      setError(passwordError.message || "Unable to sign in.");
      return;
    }

    // Step 3: Activate the session after successful authentication.
    console.log("Clerk sign-in status:", signIn.status);

    console.log(
      "Supported second factors:",
      JSON.stringify(signIn.supportedSecondFactors, null, 2)
    );

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
    setError(
      error?.message || "Something went wrong. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
}


  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Link href="/" asChild>
            <Pressable
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Back to onboarding"
            >
              <Text style={styles.backText}>‹  Back</Text>
            </Pressable>
          </Link>

          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>LL</Text>
          </View>

          <Text style={styles.brand}>LectureLens</Text>

          <Text style={styles.heading}>Welcome back</Text>

          <Text style={styles.subtitle}>
            Sign in to continue your learning journey.
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Enter your university email"
              placeholderTextColor="#94A3B8"
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

            <View style={styles.passwordHeading}>
              
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Text style={styles.showPassword}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
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
                    isLoading && { opacity: 0.6 },
                ]}
                onPress={handleLogin}
                disabled={isLoading || fetchStatus === "fetching"}
                accessibilityRole="button"
            >
                <Text style={styles.primaryButtonText}>
                    {isLoading ? "Signing In..." : "Sign In"}
                </Text>
            </Pressable>

          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>
              Don't have an account?
            </Text>

            <Link href="/register" asChild>
              <Pressable accessibilityRole="button">
                <Text style={styles.registerLink}>Register</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingRight: 16,
    marginBottom: 24,
  },
  backText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "600",
  },
  logoContainer: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  brand: {
    color: "#2563EB",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 28,
  },
  heading: {
    color: "#0F172A",
    fontSize: 29,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 30,
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 9,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 22,
  },
  passwordHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  showPassword: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 9,
  },
  error: {
    color: "#B91C1C",
    fontSize: 14,
    lineHeight: 20,
    marginTop: -10,
    marginBottom: 16,
  },
  primaryButton: {
    minHeight: 54,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  registerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 30,
  },
  registerPrompt: {
    color: "#64748B",
    fontSize: 14,
  },
  registerLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
});
