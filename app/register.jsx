import React, { useState } from "react";
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
import { useSignUp } from "@clerk/expo";

export default function RegisterScreen() {
  const { signUp, fetchStatus } = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister() {
    setError("");
    setMessage("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (fetchStatus === "fetching") {
      return;
    }

    setIsLoading(true);

    try {
      const { error: createError } = await signUp.create({
        emailAddress: cleanEmail,
        password,
        firstName: cleanName,
      });

      if (createError) {
        setError(
          createError.message || "Unable to create your account."
        );
        return;
      }

      if (signUp.status === "complete") {
        const { error: finalizeError } = await signUp.finalize({
          navigate: () => router.replace("/home"),
        });

        if (finalizeError) {
          setError(
            finalizeError.message || "Could not complete registration."
          );
        }

        return;
      }

      const emailCodeEnabled =
        signUp.unverifiedFields?.includes("emailAddress");

      if (emailCodeEnabled) {
        const { error: verificationError } =
          await signUp.verifications.sendEmailCode();

        if (verificationError) {
          setError(
            verificationError.message ||
              "Your account was started, but we could not send the verification code."
          );
          return;
        }

        setMessage(
          "A verification code has been sent to your email. Email verification is the next step to complete."
        );
      } else {
        setMessage(
          "Your registration has started, but an additional verification step is required."
        );
      }
    } catch (err) {
      setError(
        err?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.logo}>LectureLens</Text>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Create your account to organize and review your lecture notes.
            </Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#8A94A6"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
                accessibilityLabel="Full name"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8A94A6"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                accessibilityLabel="Email address"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#8A94A6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
                accessibilityLabel="Password"
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#8A94A6"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
                accessibilityLabel="Confirm password"
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPassword}
                accessibilityRole="button"
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? "Hide passwords" : "Show passwords"}
                </Text>
              </Pressable>

              {!!error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              {!!message && (
                <Text style={styles.messageText}>{message}</Text>
              )}

              <Pressable
                style={[
                  styles.primaryButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleRegister}
                disabled={isLoading || fetchStatus === "fetching"}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </Pressable>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Already have an account?{" "}
                </Text>
                <Link href="/login" style={styles.link}>
                  Sign in
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 32,
  },
  container: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 24,
  },
  logo: {
    color: "#2457C5",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 28,
  },
  title: {
    color: "#172033",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#657087",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 28,
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#263248",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    minHeight: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE2EC",
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "#172033",
    fontSize: 15,
    marginBottom: 18,
  },
  showPassword: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    marginBottom: 14,
  },
  showPasswordText: {
    color: "#2457C5",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#B42318",
    backgroundColor: "#FEF3F2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    lineHeight: 20,
  },
  messageText: {
    color: "#175CD3",
    backgroundColor: "#EFF8FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 52,
    backgroundColor: "#2457C5",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 24,
  },
  footerText: {
    color: "#657087",
    fontSize: 14,
  },
  link: {
    color: "#2457C5",
    fontSize: 14,
    fontWeight: "700",
  },
});