
import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  Alert,
  Keyboard,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { api } from "../../services/api";

import styles from "../../styles/referencesStyles";

export default function SearchReference() {
  const [searchQuery, setSearchQuery] = useState("");
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    const query = searchQuery.trim();

    if (!query) {
      Alert.alert(
        "Search required",
        "Please enter a topic or academic keyword."
      );
      return;
    }

    Keyboard.dismiss();

    setLoading(true);
    setError("");
    setReferences([]);

    try {
      const results = await api.searchAcademicReferences(query);

      setReferences(results);

      if (results.length === 0) {
        setError("No academic publications were found.");
      }
    } catch (err) {
      setError(
        err.message || "Unable to search academic references."
      );
    } finally {
      setLoading(false);
    }
  }

  async function openReference(url) {
    if (!url) {
      Alert.alert(
        "Unavailable",
        "This publication does not have an available external link."
      );
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to open",
        "Could not open the publication link."
      );
    }
  }

  return (
    <View style={{ width: "100%" }}>
      {/* Search bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#DCE3EC",
          },
        ]}
      >
        <Ionicons
          name="search"
          size={22}
          color="#12325B"
        />

        <TextInput
          placeholder="Search academic references..."
          placeholderTextColor="#9CA3AF"
          style={[
            styles.searchInput,
            {
              flex: 1,
              color: "#12325B",
            },
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        <TouchableOpacity
          onPress={handleSearch}
          disabled={loading}
          style={{
            backgroundColor: "#12325B",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
          >
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {loading && (
        <View
          style={{
            alignItems: "center",
            padding: 20,
          }}
        >
          <ActivityIndicator
            size="large"
            color="#12325B"
          />

          <Text
            style={{
              marginTop: 10,
              color: "#12325B",
            }}
          >
            Searching academic publications...
          </Text>
        </View>
      )}

      {/* Error or empty results */}
      {!loading && error !== "" && (
        <Text
          style={{
            color: "#B42318",
            marginTop: 15,
            marginBottom: 10,
          }}
        >
          {error}
        </Text>
      )}

      {/* Search results */}
      {!loading && references.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#12325B",
              marginBottom: 12,
            }}
          >
            Academic Publications
          </Text>

          {references.map((reference, index) => (
            <View
              key={reference.doi || `${reference.title}-${index}`}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 15,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#12325B",
                  marginBottom: 8,
                }}
              >
                {reference.title}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#475569",
                  marginBottom: 5,
                }}
              >
                Authors: {reference.authors || "Not available"}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#475569",
                  marginBottom: 12,
                }}
              >
                Year: {reference.year}
              </Text>

              <TouchableOpacity
                onPress={() => openReference(reference.url)}
                disabled={!reference.url}
                style={{
                  backgroundColor: "#F2B544",
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  alignSelf: "flex-start",
                  opacity: reference.url ? 1 : 0.5,
                }}
              >
                <Text
                  style={{
                    color: "#12325B",
                    fontWeight: "bold",
                  }}
                >
                  View Publication
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
