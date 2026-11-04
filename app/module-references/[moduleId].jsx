import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import HomeHeader from "../../components/home/HomeHeader";
import NavBar from "../../components/navbar";
import FloatingRecordButton from "../../components/home/FloatingRecordButton";

import { api } from "../../services/api";

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

export default function ModuleReferences() {
  const { moduleId, moduleName } = useLocalSearchParams();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResources = useCallback(async () => {
    if (!moduleId) {
      setError("Module ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const result = await api.listResources(moduleId);

      setResources(getItems(result, "resources"));
    } catch (err) {
      setError(err.message || "Could not load module resources.");
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const openResource = async (url) => {
    if (!url || !url.trim()) {
      Alert.alert(
        "Resource unavailable",
        "This resource does not have a link."
      );
      return;
    }

    try {
      await Linking.openURL(url.trim());
    } catch {
      Alert.alert(
        "Unable to open resource",
        "Please check the resource link and try again."
      );
    }
  };

  const renderResource = (resource) => {
    return (
      <TouchableOpacity
        key={resource.id}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 18,
          marginBottom: 12,
          elevation: 2,
        }}
        activeOpacity={0.75}
        onPress={() => openResource(resource.url)}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <Ionicons
            name="document-text-outline"
            size={26}
            color="#12325B"
          />

          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#12325B",
              }}
            >
              {resource.title || "Untitled resource"}
            </Text>

            {!!resource.author && (
              <Text
                style={{
                  color: "#64748B",
                  marginTop: 5,
                }}
              >
                Author: {resource.author}
              </Text>
            )}

            <Text
              style={{
                color: "#64748B",
                marginTop: 5,
                textTransform: "capitalize",
              }}
            >
              Type: {resource.resource_type || "Other"}
            </Text>

            {!!resource.url && (
              <Text
                style={{
                  color: "#2563EB",
                  marginTop: 10,
                }}
              >
                Open resource
              </Text>
            )}
          </View>

          <Ionicons
            name="open-outline"
            size={20}
            color="#64748B"
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.main,
        {
          backgroundColor: "#F5F7FB",
        },
      ]}
    >
      <HomeHeader userName="Yashar" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#12325B"
          />

          <Text
            style={{
              marginLeft: 8,
              color: "#12325B",
              fontWeight: "600",
            }}
          >
            Back to References
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 22,
            fontWeight: "800",
            color: "#12325B",
            marginBottom: 8,
          }}
        >
          {moduleName || "Module References"}
        </Text>

        <Text
          style={{
            color: "#64748B",
            marginBottom: 20,
          }}
        >
          Resources saved for this module.
        </Text>

        {loading ? (
          <View
            style={{
              alignItems: "center",
              padding: 30,
            }}
          >
            <ActivityIndicator
              size="large"
              color="#12325B"
            />

            <Text
              style={{
                color: "#64748B",
                marginTop: 10,
              }}
            >
              Loading resources...
            </Text>
          </View>
        ) : error ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 18,
            }}
          >
            <Text
              style={{
                color: "#B42318",
                marginBottom: 12,
              }}
            >
              {error}
            </Text>

            <TouchableOpacity
              onPress={loadResources}
              style={{
                backgroundColor: "#12325B",
                padding: 12,
                borderRadius: 8,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "700",
                }}
              >
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : resources.length === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 24,
              alignItems: "center",
            }}
          >
            <Ionicons
              name="library-outline"
              size={42}
              color="#12325B"
            />

            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: "#12325B",
                marginTop: 12,
              }}
            >
              No resources yet
            </Text>

            <Text
              style={{
                color: "#64748B",
                textAlign: "center",
                marginTop: 8,
                lineHeight: 20,
              }}
            >
              Resources added to this module will appear here.
            </Text>
          </View>
        ) : (
          resources.map(renderResource)
        )}
      </ScrollView>

      <FloatingRecordButton />

      <NavBar />
    </View>
  );
}