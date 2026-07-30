import React from "react";
import { View, Text } from "react-native";

import ReferenceCategory from "./ReferenceCategory";

import styles from "../../styles/referencesStyles";

export default function ReferenceCategoryList(){

    return(

        <View>

            <Text style={styles.sectionTitle}>
                Resource Categories
            </Text>

            <ReferenceCategory
                icon="document-text-outline"
                title="Lecture Slides"
            />

            <ReferenceCategory
                icon="book-outline"
                title="Books & eBooks"
            />

            <ReferenceCategory
                icon="videocam-outline"
                title="Video Tutorials"
            />

            <ReferenceCategory
                icon="globe-outline"
                title="Useful Websites"
            />

            <ReferenceCategory
                icon="newspaper-outline"
                title="Research Papers"
            />

            <ReferenceCategory
                icon="document-outline"
                title="Past Papers"
            />

            <ReferenceCategory
                icon="bookmark-outline"
                title="Saved References"
            />

        </View>

    );

}