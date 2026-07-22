import {View, Text, StyleSheet} from "react-native";
import React from "react";

import NavBar from "../components/navbar.jsx";

export default function Settings(){
    return(
        <View style={styles.container}>
            <Text style={styles.title}>
                Settings
            </Text>
            <NavBar />
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#ffffff",
        alignItems:"center",
        justifyContent:"center"
    },
    title:{
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    }
});