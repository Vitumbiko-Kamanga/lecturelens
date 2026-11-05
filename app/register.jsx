import React, { useState } from "react";
import {
  SafeAreaView,
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
import { useSignUp } from "@clerk/expo";

export default function RegisterScreen() {
  const { signUp, fetchStatus } = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
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

    if (fetchStatus === "fetching") return;

    setIsLoading(true);

    try {
      const { error: signUpError } = await signUp.password({
        emailAddress: cleanEmail,
        password,
        firstName: cleanName,
      });

      if (signUpError) {
        setError(signUpError.message || "Unable to start registration.");
        return;
      }

      const { error: sendError } =
        await signUp.verifications.sendEmailCode();

      if (sendError) {
        setError(sendError.message || "Could not send the verification code.");
        return;
      }

      setIsVerifying(true);
      setMessage(`A verification code has been sent to ${cleanEmail}.`);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify() {
    setError("");
    setMessage("");

    if (!code.trim()) {
      setError("Please enter the verification code from your email.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: verifyError } =
        await signUp.verifications.verifyEmailCode({
          code: code.trim(),
        });

      if (verifyError) {
        setError(verifyError.message || "Invalid verification code.");
        return;
      }

      if (signUp.status === "complete") {
        const { error: finalizeError } = await signUp.finalize();

        if (finalizeError) {
          setError(
            finalizeError.message || "Could not complete registration."
          );
          return;
        }

        router.replace("/home");
      } else {
        setMessage(
          "Email verified. Another account setup step may still be required."
        );
      }
    } catch (err) {
      setError(err?.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.screenContent}>
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => {
                if (isVerifying) {
                  setIsVerifying(false);
                  setCode("");
                  setError("");
                  setMessage("");
                } else {
                  router.replace("/");
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={isVerifying ? "Back to registration" : "Back to welcome screen"}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.white} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <View style={styles.logoContainer}>
              <Ionicons
                name="binoculars-outline"
                size={34}
                color={COLORS.navy}
              />
            </View>

            <Text style={styles.brand}>LectureLens</Text>
            <Text style={styles.topCaption}>Your learning, all in focus.</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.heading}>
              {isVerifying ? "Verify your email" : "Create account"}
            </Text>
            <Text style={styles.subtitle}>
              {isVerifying
                ? "Enter the verification code sent to your email."
                : "Create your account to organize and review your lecture notes."}
            </Text>

            <View style={styles.form}>
              {isVerifying ? (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={COLORS.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter verification code"
                      placeholderTextColor={COLORS.placeholder}
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      editable={!isLoading}
                      accessibilityLabel="Email verification code"
                      returnKeyType="done"
                      onSubmitEditing={handleVerify}
                    />
                  </View>

                  {!!error && <Text style={styles.errorText}>{error}</Text>}
                  {!!message && <Text style={styles.messageText}>{message}</Text>}

                  <Pressable
                    style={[
                      styles.primaryButton,
                      isLoading && styles.disabledButton,
                    ]}
                    onPress={handleVerify}
                    disabled={isLoading}
                    accessibilityRole="button"
                  >
                    <Text style={styles.primaryButtonText}>
                      {isLoading ? "Verifying..." : "Verify Email"}
                    </Text>
                    {!isLoading && (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color={COLORS.navy}
                      />
                    )}
                  </Pressable>
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={COLORS.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor={COLORS.placeholder}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!isLoading}
                      accessibilityLabel="Full name"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={COLORS.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={COLORS.placeholder}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      editable={!isLoading}
                      accessibilityLabel="Email address"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={COLORS.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter password"
                      placeholderTextColor={COLORS.placeholder}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      textContentType="newPassword"
                      editable={!isLoading}
                      accessibilityLabel="Password"
                      returnKeyType="next"
                    />
                    <Pressable
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword((previous) => !previous)}
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

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={COLORS.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter password"
                      placeholderTextColor={COLORS.placeholder}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      textContentType="newPassword"
                      editable={!isLoading}
                      accessibilityLabel="Re-enter password"
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                    />
                    <Pressable
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword((previous) => !previous)}
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

                  {!!error && <Text style={styles.errorText}>{error}</Text>}
                  {!!message && <Text style={styles.messageText}>{message}</Text>}

                  <Pressable
                    style={[
                      styles.primaryButton,
                      (isLoading || fetchStatus === "fetching") &&
                        styles.disabledButton,
                    ]}
                    onPress={handleRegister}
                    disabled={isLoading || fetchStatus === "fetching"}
                    accessibilityRole="button"
                  >
                    <Text style={styles.primaryButtonText}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Text>
                    {!isLoading && (
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={COLORS.navy}
                      />
                    )}
                  </Pressable>
                </>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Link href="/login" asChild>
                  <Pressable accessibilityRole="button">
                    <Text style={styles.link}>Sign in</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>

          <Text style={styles.bottomFooter}>
            Supporting accessible learning at MUBAS.
          </Text>
        </View>
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
  success: "#175CD3",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboard: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.navy,
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 20,
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
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  brand: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  topCaption: {
    color: "#DCE7F4",
    fontSize: 12,
    marginTop: 10,
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  heading: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 5,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 11,
  },
  inputIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    minHeight: 46,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  passwordToggle: {
    padding: 5,
    marginLeft: 4,
  },
  errorText: {
    color: COLORS.error,
    backgroundColor: "#FEF3F2",
    borderRadius: 8,
    padding: 9,
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 17,
  },
  messageText: {
    color: COLORS.success,
    backgroundColor: "#EFF8FF",
    borderRadius: 8,
    padding: 9,
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButton: {
    minHeight: 50,
    backgroundColor: COLORS.gold,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 2,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.navyDark,
    fontSize: 15,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 14,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  link: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: "800",
  },
  bottomFooter: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
  },
});
