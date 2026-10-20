import React from "react";
import { View, Text } from "react-native";
import {Ionicons} from "@expo/vector-icons";
import { TouchableOpacity, Text } from "react-native";

import styles from "../../styles/homeStyles";

export default function HomeHeader({ userName }) {

    return (

        <View style={styles.header}>
            <View style={styles.usernameContainer}>
                <Text style={styles.userName}>
                    {userName[0]}
                </Text>
            </View>
            <View>
                <Ionicons
                    name="binoculars-outline"
                    size={22}
                />
            </View>

            <View>
                <Ionicons
                    name="menu-outline"
                    size={22}
                    color="#FFF"
                />
            </View>

            <TouchableOpacity
            onPress={() => router.push("/modules")}
            style={{
                backgroundColor: "#12325B",
                padding: 14,
                borderRadius: 10,
                marginHorizontal: 16,
                marginVertical: 10,
            }}
            >
            <Text style={{ color: "#FFFFFF", fontWeight: "700", textAlign: "center" }}>
                + Manage Modules & Lectures
            </Text>
            </TouchableOpacity>
        </View>

    );

}