import {ScrollView, Text, View, StyleSheet} from "react-native";
import React from "react";

import NavBar from "../components/navbar.jsx";
import FloatingRecordButton from "../components/home/FloatingRecordButton";
import HomeHeader from "../components/home/HomeHeader";

export default function References(){
    return(

    <View style={{flex:1}}>
        <HomeHeader userName="Yashar" />
        <ScrollView style={styles.container}>
            <Text style={styles.title}>
                References coming soon!
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
        backgroundColor:"#ffffff",
        paddingHorizontal:20,
        paddingTop:60,        
    },
    title:{
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    }
});