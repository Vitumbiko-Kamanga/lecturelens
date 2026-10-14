
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "../services/api";

export default function ApiTestScreen() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  async function runTests() {
    setLoading(true);
    setResults([]);

    const tests = [
      {
        name: "Backend connection",
        run: () => api.testBackend(),
      },
      {
        name: "Database connection",
        run: () => api.testDatabase(),
      },
      {
        name: "Load student modules",
        run: () => api.listModules(),
      },
    ];

    const output = [];

    for (const test of tests) {
      try {
        const data = await test.run();

        output.push({
          name: test.name,
          success: true,
          message:
            test.name === "Load student modules"
              ? `${data.length} module(s) found`
              : data.message || "Connected successfully",
        });
      } catch (error) {
        output.push({
          name: test.name,
          success: false,
          message: error.message,
        });
      }

      setResults([...output]);
    }

    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>LectureLens</Text>
        <Text style={styles.heading}>Connection Test</Text>
        <Text style={styles.description}>
          Check whether the mobile app can communicate with the
          backend and database.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={runTests}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Testing..." : "Test Connections"}
          </Text>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.loader}
          />
        )}

        {results.map((result) => (
          <View key={result.name} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{result.name}</Text>
              <Text
                style={[
                  styles.status,
                  {
                    color: result.success ? "#15803D" : "#B91C1C",
                  },
                ]}
              >
                {result.success ? "PASS" : "FAILED"}
              </Text>
            </View>

            <Text style={styles.resultMessage}>{result.message}</Text>
          </View>
        ))}
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
    padding: 24,
    paddingTop: 40,
  },
  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
  },
  description: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  loader: {
    marginTop: 24,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  resultTitle: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 15,
    flex: 1,
  },
  status: {
    fontWeight: "700",
    fontSize: 12,
  },
  resultMessage: {
    color: "#475569",
    marginTop: 10,
    lineHeight: 20,
  },
});
