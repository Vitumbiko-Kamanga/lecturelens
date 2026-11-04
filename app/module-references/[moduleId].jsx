
import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
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

const RESOURCE_TYPES = [
  "book",
  "article",
  "website",
  "paper",
  "video",
  "other",
];

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

  const [showForm, setShowForm] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceAuthor, setResourceAuthor] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceType, setResourceType] = useState("book");

  const [resourceSaving, setResourceSaving] = useState(false);
  const [deletingResourceId, setDeletingResourceId] = useState(null);

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

  function resetResourceForm() {
    setResourceTitle("");
    setResourceAuthor("");
    setResourceUrl("");
    setResourceType("book");
    setEditingResourceId(null);
    setShowForm(false);
  }

  function startEditingResource(resource) {
    setEditingResourceId(resource.id);
    setResourceTitle(resource.title || "");
    setResourceAuthor(resource.author || "");
    setResourceUrl(resource.url || "");
    setResourceType(resource.resource_type || "other");
    setShowForm(true);
  }

  async function saveResource() {
    if (!resourceTitle.trim()) {
      Alert.alert(
        "Resource title required",
        "Enter the resource title."
      );
      return;
    }

    const cleanUrl = resourceUrl.trim();

    if (
      cleanUrl &&
      !/^https?:\/\/\S+$/i.test(cleanUrl)
    ) {
      Alert.alert(
        "Invalid URL",
        "Enter a valid link beginning with https:// or http://."
      );
      return;
    }

    setResourceSaving(true);

    try {
      const resourceData = {
        title: resourceTitle.trim(),
        author: resourceAuthor.trim(),
        url: cleanUrl,
        resource_type: resourceType,
      };

      if (editingResourceId !== null) {
        const result = await api.updateResource(
          editingResourceId,
          resourceData
        );

        const updatedResource = result?.resource || result;

        if (updatedResource?.id) {
          setResources((previous) =>
            previous.map((item) =>
              String(item.id) === String(editingResourceId)
                ? updatedResource
                : item
            )
          );
        } else {
          await loadResources();
        }

        resetResourceForm();

        Alert.alert(
          "Resource updated",
          "Your learning resource has been updated."
        );
      } else {
        const result = await api.createResource(
          moduleId,
          resourceData
        );

        const savedResource = result?.resource || result;

        if (savedResource?.id) {
          setResources((previous) => [
            savedResource,
            ...previous,
          ]);
        } else {
          await loadResources();
        }

        resetResourceForm();

        Alert.alert(
          "Resource saved",
          "Your learning resource has been saved."
        );
      }
    } catch (err) {
      Alert.alert(
        editingResourceId !== null
          ? "Could not update resource"
          : "Could not save resource",
        err.message || "Please try again."
      );
    } finally {
      setResourceSaving(false);
    }
  }

  function confirmDeleteResource(resource) {
    if (!resource?.id) {
      Alert.alert(
        "Cannot delete resource",
        "The resource ID is missing."
      );
      return;
    }

    Alert.alert(
      "Delete resource",
      `Are you sure you want to delete "${resource.title || "Untitled resource"}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteResource(resource),
        },
      ]
    );
  }

  async function deleteResource(resource) {
    if (!resource?.id || deletingResourceId !== null) {
      return;
    }

    setDeletingResourceId(resource.id);

    try {
      await api.deleteResource(resource.id);

      setResources((previous) =>
        previous.filter(
          (item) => String(item.id) !== String(resource.id)
        )
      );

      if (
        String(editingResourceId) === String(resource.id)
      ) {
        resetResourceForm();
      }

      Alert.alert(
        "Resource deleted",
        "The resource has been removed successfully."
      );
    } catch (err) {
      Alert.alert(
        "Could not delete resource",
        err.message || "Please try again."
      );
    } finally {
      setDeletingResourceId(null);
    }
  }

  async function openResource(resource) {
    if (!resource.url) {
      Alert.alert(
        "No link available",
        "This resource does not have a URL saved."
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(
        resource.url
      );

      if (!supported) {
        Alert.alert(
          "Cannot open link",
          "This URL cannot be opened."
        );
        return;
      }

      await Linking.openURL(resource.url);
    } catch (err) {
      Alert.alert(
        "Could not open resource",
        err.message || "Please check the saved URL."
      );
    }
  }

  function renderResource(resource) {
    const isDeleting =
      String(deletingResourceId) === String(resource.id);

    const isEditing =
      String(editingResourceId) === String(resource.id);

    return (
      <View
        key={resource.id}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 18,
          marginBottom: 12,
          elevation: 2,
        }}
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
              <TouchableOpacity
                onPress={() => openResource(resource)}
                style={{
                  alignSelf: "flex-start",
                  marginTop: 10,
                }}
              >
                <Text
                  style={{
                    color: "#2563EB",
                    fontWeight: "600",
                  }}
                >
                  Open resource
                </Text>
              </TouchableOpacity>
            )}

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 14,
              }}
            >
              <TouchableOpacity
                onPress={() => startEditingResource(resource)}
                disabled={
                  deletingResourceId !== null ||
                  resourceSaving
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: "#EFF6FF",
                }}
              >
                <Ionicons
                  name="create-outline"
                  size={17}
                  color="#12325B"
                />

                <Text
                  style={{
                    color: "#12325B",
                    fontWeight: "600",
                    marginLeft: 6,
                  }}
                >
                  {isEditing ? "Editing" : "Edit Resource"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmDeleteResource(resource)}
                disabled={
                  deletingResourceId !== null ||
                  resourceSaving ||
                  isEditing
                }
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: "#FEF2F2",
                  opacity: isEditing ? 0.5 : 1,
                }}
              >
                {isDeleting ? (
                  <ActivityIndicator
                    size="small"
                    color="#B42318"
                  />
                ) : (
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color="#B42318"
                  />
                )}

                <Text
                  style={{
                    color: "#B42318",
                    fontWeight: "600",
                    marginLeft: 6,
                  }}
                >
                  {isDeleting ? "Deleting..." : "Delete Resource"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

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
        keyboardShouldPersistTaps="handled"
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

        <TouchableOpacity
          onPress={() => {
            if (showForm) {
              resetResourceForm();
            } else {
              setShowForm(true);
            }
          }}
          activeOpacity={0.8}
          disabled={resourceSaving}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#12325B",
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
          }}
        >
          <Ionicons
            name={showForm ? "close" : "add-circle-outline"}
            size={22}
            color="#FFFFFF"
          />

          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: "700",
              marginLeft: 8,
            }}
          >
            {showForm
              ? "Cancel"
              : "Add Resource"}
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 18,
              marginBottom: 22,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#12325B",
                marginBottom: 18,
              }}
            >
              {editingResourceId !== null
                ? "Edit Learning Resource"
                : "Add Learning Resource"}
            </Text>

            <Text style={formLabel}>Resource title *</Text>

            <TextInput
              value={resourceTitle}
              onChangeText={setResourceTitle}
              placeholder="e.g. Introduction to Database Systems"
              style={formInput}
              editable={!resourceSaving}
            />

            <Text style={formLabel}>Author (optional)</Text>

            <TextInput
              value={resourceAuthor}
              onChangeText={setResourceAuthor}
              placeholder="Enter author or publisher"
              style={formInput}
              editable={!resourceSaving}
            />

            <Text style={formLabel}>Resource URL (optional)</Text>

            <TextInput
              value={resourceUrl}
              onChangeText={setResourceUrl}
              placeholder="https://example.com"
              autoCapitalize="none"
              keyboardType="url"
              style={formInput}
              editable={!resourceSaving}
            />

            <Text style={formLabel}>Resource type</Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {RESOURCE_TYPES.map((type) => {
                const selected = resourceType === type;

                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setResourceType(type)}
                    disabled={resourceSaving}
                    style={{
                      borderWidth: 1,
                      borderColor: selected
                        ? "#F2B544"
                        : "#D0D5DD",
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      backgroundColor: selected
                        ? "#FFF9E9"
                        : "#FFFFFF",
                    }}
                  >
                    <Text
                      style={{
                        color: selected
                          ? "#12325B"
                          : "#344054",
                        fontWeight: selected
                          ? "700"
                          : "400",
                        fontSize: 12,
                      }}
                    >
                      {type === "paper"
                        ? "Research paper"
                        : type.charAt(0).toUpperCase() +
                          type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={saveResource}
              disabled={resourceSaving}
              style={{
                backgroundColor: resourceSaving
                  ? "#64748B"
                  : "#12325B",
                borderRadius: 10,
                padding: 14,
                alignItems: "center",
              }}
            >
              {resourceSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "700",
                  }}
                >
                  {editingResourceId !== null
                    ? "Save Changes"
                    : "Save Resource"}
                </Text>
              )}
            </TouchableOpacity>

            {editingResourceId !== null && (
              <TouchableOpacity
                onPress={resetResourceForm}
                disabled={resourceSaving}
                style={{
                  padding: 12,
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    color: "#64748B",
                    fontWeight: "600",
                  }}
                >
                  Cancel Edit
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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
              Use Add Resource to save learning materials for this module.
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

const formLabel = {
  color: "#12325B",
  fontWeight: "600",
  marginBottom: 8,
};

const formInput = {
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#D0D5DD",
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 12,
  fontSize: 15,
  marginBottom: 16,
};
