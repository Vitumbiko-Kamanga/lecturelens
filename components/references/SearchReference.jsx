import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Keyboard,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

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

  function createCitation(reference) {
    const authors = reference.authors?.trim() || "Author unavailable";

    const year =
      typeof reference.year === "number" ||
      /^\d{4}$/.test(String(reference.year))
        ? reference.year
        : "n.d.";

    const title =
      reference.title?.trim() || "Untitled publication";

    const url = reference.url || "";

    return `${authors}. (${year}). ${title}.${url ? ` ${url}` : ""}`;
  }

  async function copyCitation(reference) {
    try {
      const citation = createCitation(reference);

      await Clipboard.setStringAsync(citation);

      Alert.alert(
        "Citation copied",
        "The publication citation has been copied to your clipboard."
      );
    } catch {
      Alert.alert(
        "Copy failed",
        "Unable to copy the citation. Please try again."
      );
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
          activeOpacity={0.8}
          style={{
            backgroundColor: "#12325B",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 10,
            opacity: loading ? 0.6 : 1,
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
              {/* Publication title */}
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

              {/* Authors */}
              <Text
                style={{
                  fontSize: 14,
                  color: "#475569",
                  marginBottom: 5,
                }}
              >
                Authors: {reference.authors || "Not available"}
              </Text>

              {/* Publication year */}
              <Text
                style={{
                  fontSize: 14,
                  color: "#475569",
                  marginBottom: 12,
                }}
              >
                Year: {reference.year}
              </Text>

              {/* Publication actions */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {/* View publication */}
                <TouchableOpacity
                  onPress={() => openReference(reference.url)}
                  disabled={!reference.url}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: "#F2B544",
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                    opacity: reference.url ? 1 : 0.5,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color="#12325B"
                  />

                  <Text
                    style={{
                      color: "#12325B",
                      fontWeight: "bold",
                      marginLeft: 6,
                    }}
                  >
                    View Publication
                  </Text>
                </TouchableOpacity>

                {/* Copy citation */}
                <TouchableOpacity
                  onPress={() => copyCitation(reference)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: "#12325B",
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="copy-outline"
                    size={16}
                    color="#FFFFFF"
                  />

                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "bold",
                      marginLeft: 6,
                    }}
                  >
                    Copy Citation
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}