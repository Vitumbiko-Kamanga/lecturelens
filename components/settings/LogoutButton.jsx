import React from "react";
import {TouchableOpacity, Text,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../styles/settingsStyles";

export default function LogoutButton({onPress,}) {

    return (

        <TouchableOpacity
            style={styles.logout}
            onPress={onPress}
        >

            <Ionicons
                name="log-out-outline"
                size={22}
                color="red"
            />

            <Text style={styles.logoutText}> Log Out </Text>

        </TouchableOpacity>

    );

}