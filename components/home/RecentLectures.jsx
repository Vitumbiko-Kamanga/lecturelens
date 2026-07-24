import React from "react";
import { View, Text } from "react-native";

import LectureCard from "./LectureCard";

import styles from "../../styles/homeStyles";

export default function RecentLectures(){

    return(

        <View>

            <Text style={styles.sectionTitle}>

                Recent Lectures

            </Text>

            <LectureCard
                title="Database Systems"
                date="Today"
                status="Summary Ready"
                color="#10B981"
            />

            <LectureCard
                title="Operating Systems"
                date="Yesterday"
                status="Recording"
                color="#F59E0B"
            />

        </View>

    );

}