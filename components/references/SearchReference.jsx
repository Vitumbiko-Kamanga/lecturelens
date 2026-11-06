
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
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { api } from "../../services/api";

const NAVY = "#12325B";
const GOLD = "#F2B544";

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
    const authors =
      reference.authors?.trim() || "Author unavailable";

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
      await Clipboard.setStringAsync(createCitation(reference));

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
    <View style={localStyles.container}>
      <Text style={localStyles.heading}>
        Find Academic References
      </Text>

      <Text style={localStyles.description}>
        Search for publications, research papers, and academic sources
        to support your studies.
      </Text>

      {/* Search bar */}
      <View style={localStyles.searchBar}>
        <Ionicons
          name="search-outline"
          size={22}
          color={NAVY}
        />

        <TextInput
          placeholder="Search academic references..."
          placeholderTextColor="#98A2B3"
          style={localStyles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          editable={!loading}
        />

        <TouchableOpacity
          onPress={handleSearch}
          disabled={loading}
          activeOpacity={0.8}
          style={[
            localStyles.searchButton,
            loading && localStyles.disabledButton,
          ]}
        >
          <Text style={localStyles.searchButtonText}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && (
        <View style={localStyles.statusContainer}>
          <ActivityIndicator size="large" color={NAVY} />

          <Text style={localStyles.statusText}>
            Searching academic publications...
          </Text>
        </View>
      )}

      {/* Error / empty result */}
      {!loading && error !== "" && (
        <View style={localStyles.messageCard}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#B42318"
          />

          <Text style={localStyles.errorText}>
            {error}
          </Text>
        </View>
      )}

      {/* Results */}
      {!loading && references.length > 0 && (
        <View style={localStyles.resultsContainer}>
          <Text style={localStyles.resultsHeading}>
            Academic Publications
          </Text>

          <Text style={localStyles.resultsCount}>
            {references.length} publication(s) found
          </Text>

          {references.map((reference, index) => (
            <View
              key={reference.doi || `${reference.title}-${index}`}
              style={localStyles.referenceCard}
            >
              <View style={localStyles.cardHeader}>
                <View style={localStyles.bookIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={NAVY}
                  />
                </View>

                <View style={localStyles.titleContainer}>
                  <Text style={localStyles.referenceTitle}>
                    {reference.title || "Untitled publication"}
                  </Text>
                </View>
              </View>

              <Text style={localStyles.metadata}>
                Authors: {reference.authors || "Not available"}
              </Text>

              <Text style={localStyles.metadata}>
                Year: {reference.year || "Not available"}
              </Text>

              <View style={localStyles.actions}>
                <TouchableOpacity
                  onPress={() => openReference(reference.url)}
                  disabled={!reference.url}
                  activeOpacity={0.8}
                  style={[
                    localStyles.viewButton,
                    !reference.url && localStyles.disabledButton,
                  ]}
                >
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color={NAVY}
                  />

                  <Text style={localStyles.viewButtonText}>
                    View Publication
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => copyCitation(reference)}
                  activeOpacity={0.8}
                  style={localStyles.copyButton}
                >
                  <Ionicons
                    name="copy-outline"
                    size={16}
                    color="#FFFFFF"
                  />

                  <Text style={localStyles.copyButtonText}>
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

const localStyles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 24,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 6,
  },

  description: {
    fontSize: 13,
    color: "#667085",
    lineHeight: 20,
    marginBottom: 16,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#DCE3EC",
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
    fontSize: 14,
    color: NAVY,
    paddingVertical: 6,
  },

  searchButton: {
    backgroundColor: NAVY,
    borderBottomWidth: 3,
    borderBottomColor: GOLD,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9,
  },

  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.5,
  },

  statusContainer: {
    alignItems: "center",
    padding: 22,
  },

  statusText: {
    marginTop: 10,
    color: NAVY,
    fontSize: 13,
  },

  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },

  errorText: {
    color: "#B42318",
    marginLeft: 10,
    flex: 1,
  },

  resultsContainer: {
    marginTop: 22,
  },

  resultsHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
  },

  resultsCount: {
    fontSize: 12,
    color: "#667085",
    marginTop: 4,
    marginBottom: 14,
  },

  referenceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  bookIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFF6E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  titleContainer: {
    flex: 1,
  },

  referenceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    lineHeight: 22,
  },

  metadata: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
    lineHeight: 19,
  },

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  viewButtonText: {
    color: NAVY,
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 6,
  },

  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  copyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 6,
  },
});
