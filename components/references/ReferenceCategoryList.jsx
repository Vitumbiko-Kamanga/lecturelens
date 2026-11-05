import React from "react";
import {
  View,
  Text,
  Linking,
  Alert,
} from "react-native";

import ReferenceCategory from "./ReferenceCategory";
import styles from "../../styles/referencesStyles";

const resourceCategories = [
  {
    title: "Lecture Slides",
    icon: "document-text-outline",
    query: "university lecture slides educational resources",
  },
  {
    title: "Books & eBooks",
    icon: "book-outline",
    query: "academic books and ebooks for university students",
  },
  {
    title: "Video Tutorials",
    icon: "videocam-outline",
    query: "educational video tutorials university subjects",
  },
  {
    title: "Useful Websites",
    icon: "globe-outline",
    query: "useful educational websites for university students",
  },
  {
    title: "Research Papers",
    icon: "newspaper-outline",
    query: "academic research papers",
  },
  {
    title: "Past Papers",
    icon: "document-outline",
    query: "university past examination papers",
  },
];

export default function ReferenceCategoryList() {
  const openResourceSearch = async (query) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(
      query
    )}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        "Unable to open search",
        "Please check your internet connection and try again."
      );
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Explore Resources
      </Text>

      <Text
        style={{
          color: "#64748B",
          fontSize: 14,
          marginBottom: 15,
          lineHeight: 20,
        }}
      >
        Find academic materials and learning resources for your studies.
      </Text>

      {resourceCategories.map((category) => (
        <ReferenceCategory
          key={category.title}
          icon={category.icon}
          title={category.title}
          onPress={() => openResourceSearch(category.query)}
        />
      ))}

      <ReferenceCategory
        icon="bookmark-outline"
        title="Saved References"
        disabled
      />
    </View>
  );
}