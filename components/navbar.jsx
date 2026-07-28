import { StyleSheet, Text, View,Image } from "react-native";
import React from "react";

import NavLink from "./navelement.jsx";

export default function NavBar(){

    return( 
        <View style={styles.dash}>
            <NavLink name="home-outline" title="Home" href="/" />
            <NavLink name="book-outline" title="Notes" href="/notes" />
            <NavLink name="reader-outline" title="References" href="/references" />
            <NavLink name="settings-outline" title="Settings" href="/settings" />
        </View>
    );

}

const styles = StyleSheet.create({

    dash:{
        flexDirection:"row",
        justifyContent:"space-around",
        width:"100%",
        marginTop:20,
        position:"absolute",
        bottom:0,
        paddingBottom:20,
        backgroundColor:"#f0f0f0",
        borderTopWidth:1,
        borderTopColor:"#ccc",
    },

});