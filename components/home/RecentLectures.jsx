
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

import { api } from "../../services/api";
import LectureCard from "./LectureCard";
import styles from "../../styles/homeStyles";

function formatLectureDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (first, second) =>
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();

    if (sameDay(date, today)) return "Today";
    if (sameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString();
}

export default function RecentLectures() {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadRecentLectures() {
            try {
                setLoading(true);
                setError("");

                // Load only the signed-in student's modules.
                const modules = await api.listModules();

                // Retrieve lectures belonging to those modules.
                const lectureGroups = await Promise.all(
                    modules.map(async (module) => {
                        const moduleLectures =
                            await api.listLectures(module.id);

                        return moduleLectures.map((lecture) => ({
                            ...lecture,
                            moduleName: module.name,
                        }));
                    })
                );

                const allLectures = lectureGroups
                    .flat()
                    .sort((a, b) => {
                        const dateA = new Date(
                            a.lecture_date || a.created_at || 0
                        ).getTime();

                        const dateB = new Date(
                            b.lecture_date || b.created_at || 0
                        ).getTime();

                        return dateB - dateA;
                    })
                    .slice(0, 3);

                if (active) {
                    setLectures(allLectures);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.message || "Could not load recent lectures."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadRecentLectures();

        return () => {
            active = false;
        };
    }, []);

    return (
        <View style={{ marginBottom: 200 }}>
            <Text style={styles.sectionTitle}>
                Recent Lectures
            </Text>

            {loading && (
                <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator
                        size="small"
                        color="#2563EB"
                    />
                    <Text style={{ textAlign: "center", marginTop: 8 }}>
                        Loading your lectures...
                    </Text>
                </View>
            )}

            {!loading && error !== "" && (
                <Text
                    style={{
                        color: "#DC2626",
                        marginVertical: 12,
                    }}
                >
                    {error}
                </Text>
            )}

            {!loading && !error && lectures.length === 0 && (
                <Text
                    style={{
                        color: "#64748B",
                        marginVertical: 12,
                    }}
                >
                    No lectures yet. Create a module and add your first
                    lecture to see it here.
                </Text>
            )}

            {!loading &&
                lectures.map((lecture) => (
                    <LectureCard
                        key={lecture.id}
                        title={lecture.title}
                        date={formatLectureDate(
                            lecture.lecture_date || lecture.created_at
                        )}
                        status={lecture.topic || "Lecture saved"}
                        color="#2563EB"
                    />
                ))}
        </View>
    );
}
