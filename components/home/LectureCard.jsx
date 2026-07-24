import React from "react";

import {

    View,
    Text,
    TouchableOpacity,

} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import styles from "../../styles/homeStyles";

export default function LectureCard({

    title,

    date,

    status,

    color,

}){

    return(

        <View style={styles.lectureCard}>

            <View style={styles.cardHeader}>

                <View>

                    <Text style={styles.lectureTitle}>

                        {title}

                    </Text>

                    <Text style={styles.lectureDate}>

                        {date}

                    </Text>

                </View>

                <Ionicons

                    name="book"

                    size={26}

                    color="#2563EB"

                />

            </View>

            <View
                style={[
                    styles.statusBadge,
                    {backgroundColor:color}
                ]}
            >

                <Text style={styles.statusText}>

                    {status}

                </Text>

            </View>

            <View style={styles.buttonRow}>

                <TouchableOpacity style={styles.primaryButton}>

                    <Text style={styles.primaryButtonText}>

                        Summary

                    </Text>

                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton}>

                    <Text style={styles.secondaryButtonText}>

                        Notes

                    </Text>

                </TouchableOpacity>

            </View>

        </View>

    );

}