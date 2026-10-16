
import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/expo";

import NavBar from "../components/navbar";
import styles from "../styles/settingsStyles";

export default function Profile() {
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const fullName =
        user?.fullName ||
        user?.firstName ||
        "Student";

    const email =
        user?.primaryEmailAddress?.emailAddress ||
        "No email address available";

    if (!isLoaded) {
        return (
            <View style={styles.main}>
                <Text style={{ margin: 24, color: "#FFFFFF" }}>
                    Loading profile...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.main}>
            <View
                style={{
                    marginTop: 50,
                    paddingHorizontal: 22,
                    marginBottom: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 20,
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    accessibilityLabel="Go back"
                >
                    <Ionicons
                        name="arrow-back-outline"
                        size={26}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>

                <Text style={styles.title}>
                    Profile Information
                </Text>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                <View
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 20,
                        padding: 24,
                        alignItems: "center",
                        marginBottom: 20,
                    }}
                >
                    <View style={styles.avatar}>
                        <Ionicons
                            name="person"
                            size={38}
                            color="#2563EB"
                        />
                    </View>

                    <Text
                        style={[
                            styles.name,
                            {
                                marginTop: 14,
                                fontSize: 20,
                                textAlign: "center",
                            },
                        ]}
                    >
                        {fullName}
                    </Text>

                    <Text
                        style={[
                            styles.email,
                            { textAlign: "center" },
                        ]}
                    >
                        {email}
                    </Text>
                </View>

                <Text style={styles.section}>
                    PERSONAL INFORMATION
                </Text>

                <View style={styles.row}>
                    <View style={styles.left}>
                        <Ionicons
                            name="person-outline"
                            size={24}
                            color="#2563EB"
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.itemSubtitle}>
                                Full name
                            </Text>
                            <Text style={styles.itemTitle}>
                                {fullName}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.left}>
                        <Ionicons
                            name="mail-outline"
                            size={24}
                            color="#2563EB"
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.itemSubtitle}>
                                Email address
                            </Text>
                            <Text style={styles.itemTitle}>
                                {email}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text
                    style={{
                        color: "#666666",
                        fontSize: 13,
                        lineHeight: 20,
                        marginTop: 10,
                        marginBottom: 20,
                    }}
                >
                    Your profile information comes from your
                    LectureLens sign-in account.
                </Text>
            </ScrollView>

            <NavBar />
        </View>
    );
}
