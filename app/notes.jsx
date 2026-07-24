import { ScrollView, View, Text, StyleSheet } from "react-native";
import React from "react";

import NavBar from "../components/navbar.jsx";
import FloatingRecordButton from "../components/home/FloatingRecordButton";

export default function Notes(){
    return(
    <View style={{flex:1}}>
        <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={true}
        >
            <Text style={styles.title}>
                Notes
            </Text>
        </ScrollView>
        <FloatingRecordButton />
        <NavBar />
    </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#F5F7FB",
        paddingHorizontal:20,
        paddingTop:60,
    },
    title:{
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    }
});