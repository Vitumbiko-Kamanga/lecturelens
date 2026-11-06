
import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { api } from "../../services/api";
import ModuleFolder from "./ModuleFolder";
import styles from "../../styles/referencesStyles";

const NAVY = "#12325B";
const GOLD = "#F2B544";

function getItems(result, key) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.[key])) {
    return result[key];
  }

  return [];
}

export default function ModuleList() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadModules = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await api.listModules();

      setModules(getItems(result, "modules"));
    } catch (err) {
      setError(err.message || "Could not load your modules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  return (
    <View style={localStyles.section}>
      <Text style={styles.sectionTitle}>
        Browse by Module
      </Text>

      {loading ? (
        <View style={localStyles.statusContainer}>
          <ActivityIndicator size="large" color={NAVY} />

          <Text style={localStyles.statusText}>
            Loading your modules...
          </Text>
        </View>
      ) : error ? (
        <View style={localStyles.messageCard}>
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color="#B42318"
          />

          <Text style={localStyles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={localStyles.retryButton}
            onPress={loadModules}
            activeOpacity={0.8}
          >
            <Text style={localStyles.retryText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : modules.length === 0 ? (
        <View style={localStyles.messageCard}>
          <View style={localStyles.emptyIcon}>
            <Ionicons
              name="folder-open-outline"
              size={32}
              color={NAVY}
            />
          </View>

          <Text style={localStyles.emptyTitle}>
            No modules yet
          </Text>

          <Text style={localStyles.emptyDescription}>
            Create your own modules from Manage Modules & Lectures
            on the Home screen. Your modules will appear here.
          </Text>
        </View>
      ) : (
        modules.map((module) => (
          <ModuleFolder
            key={module.id}
            moduleId={module.id}
            title={module.name || module.title || "Untitled module"}
          />
        ))
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },

  statusContainer: {
    alignItems: "center",
    padding: 24,
  },

  statusText: {
    color: "#475569",
    marginTop: 10,
    fontSize: 14,
  },

  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8EDF3",
  },

  emptyIcon: {
    backgroundColor: "#FFF6E0",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },

  emptyTitle: {
    color: NAVY,
    fontWeight: "700",
    fontSize: 16,
    marginTop: 8,
  },

  emptyDescription: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },

  errorText: {
    color: "#B42318",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 14,
  },

  retryButton: {
    backgroundColor: NAVY,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    borderBottomWidth: 3,
    borderBottomColor: GOLD,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
