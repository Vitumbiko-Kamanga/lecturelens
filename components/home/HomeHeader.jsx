import React from "react";
import { View, Text } from "react-native";

import styles from "../../styles/homeStyles";

export default function HomeHeader({ userName }) {

    return (

        <View style={styles.header}>

            <Text style={styles.greeting}>

                Good Morning,

            </Text>

            <Text style={styles.userName}>

                {userName}

            </Text>

            <Text style={styles.tagline}>

                Let's capture today's learning.

            </Text>

        </View>

    );

}