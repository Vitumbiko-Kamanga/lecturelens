import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { api } from "../../services/api";
import styles from "../../styles/homeStyles";

function getItems(result, key) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.[key])) return result[key];
  return [];
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSearchItems() {
      try {
        setLoading(true);
        setError("");

        const moduleResult = await api.listModules();
        const modules = getItems(moduleResult, "modules");

        const moduleItems = modules.map((module) => ({
          id: `module-${module.id}`,
          type: "Module",
          title: module.name || module.title || "Untitled module",
          moduleId: module.id,
        }));

        const lectureGroups = await Promise.all(
          modules.map(async (module) => {
            const result = await api.listLectures(module.id);
            const lectures = getItems(result, "lectures");

            return lectures.map((lecture) => ({
              id: `lecture-${lecture.id}`,
              type: "Lecture",
              title: lecture.title || "Untitled lecture",
              moduleName: module.name || module.title || "Module",
              moduleId: module.id,
              lectureId: lecture.id,
            }));
          })
        );

        if (active) setItems([...moduleItems, ...lectureGroups.flat()]);
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load search results.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSearchItems();

    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return [];

    return items
      .filter((item) => {
        const titleMatches = (item.title || "")
          .toLowerCase()
          .includes(search);
        const moduleMatches = (item.moduleName || "")
          .toLowerCase()
          .includes(search);
        return titleMatches || moduleMatches;
      })
      .slice(0, 10);
  }, [items, query]);

  function openResult(item) {
    setQuery("");

    router.push({
      pathname: "/modules",
      params: {
        moduleId: String(item.moduleId),
        ...(item.lectureId != null
          ? { lectureId: String(item.lectureId) }
          : {}),
      },
    });
  }

  return (
    <View style={{ marginHorizontal: 16, marginVertical: 12 }}>
      <View style={styles.searchSection}>
        <Ionicons name="search" size={22} color="#9CA3AF" />

        <TextInput
          style={[styles.searchInput, { flex: 1 }]}
          placeholder="Search modules and lectures..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search modules and lectures"
        />

        {!!query && (
          <Pressable
            onPress={() => setQuery("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={20} color="#64748B" />
          </Pressable>
        )}
      </View>

      {loading && query.trim().length > 0 && (
        <ActivityIndicator style={{ marginTop: 12 }} color="#12325B" />
      )}

      {!!error && query.trim().length > 0 && (
        <Text style={{ color: "#DC2626", marginTop: 8 }}>{error}</Text>
      )}

      {!loading && !error && query.trim().length > 0 && (
        <View
          style={{
            marginTop: 8,
            backgroundColor: "#FFFFFF",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            overflow: "hidden",
          }}
        >
          {results.length === 0 ? (
            <Text style={{ padding: 12, color: "#64748B" }}>
              No matching modules or lectures found.
            </Text>
          ) : (
            results.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => openResult(item)}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E2E8F0",
                }}
              >
                <Text style={{ color: "#12325B", fontWeight: "600" }}>
                  {item.title}
                </Text>
                <Text
                  style={{ color: "#64748B", fontSize: 12, marginTop: 3 }}
                >
                  {item.type}
                  {item.moduleName ? ` • ${item.moduleName}` : ""}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}
