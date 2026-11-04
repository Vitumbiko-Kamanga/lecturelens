import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { api } from "../../services/api";
import ModuleFolder from "./ModuleFolder";
import styles from "../../styles/referencesStyles";

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
    <View style={{ marginBottom: 20 }}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: "#12325B",
            fontSize: 18,
          },
        ]}
      >
        Browse by Module
      </Text>

      {loading ? (
        <View style={{ alignItems: "center", padding: 20 }}>
          <ActivityIndicator size="large" color="#12325B" />

          <Text style={{ color: "#475569", marginTop: 10 }}>
            Loading your modules...
          </Text>
        </View>
      ) : error ? (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 15,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#B42318", marginBottom: 12 }}>
            {error}
          </Text>

          <TouchableOpacity
            onPress={loadModules}
            style={{
              backgroundColor: "#12325B",
              padding: 12,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : modules.length === 0 ? (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 18,
            alignItems: "center",
          }}
        >
          <Ionicons
            name="folder-open-outline"
            size={36}
            color="#12325B"
          />

          <Text
            style={{
              color: "#12325B",
              fontWeight: "700",
              fontSize: 16,
              marginTop: 10,
            }}
          >
            No modules yet
          </Text>

          <Text
            style={{
              color: "#64748B",
              textAlign: "center",
              marginTop: 6,
              lineHeight: 20,
            }}
          >
            Create your own modules from Manage Modules & Lectures on the
            Home screen. Your modules will appear here.
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