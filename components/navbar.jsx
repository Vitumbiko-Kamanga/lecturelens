import { StyleSheet, Text, View,Image } from "react-native";
import React from "react";

import NavLink from "./navelement.jsx";
import Home from "../assets/proicons/home.png";
import Notes from "../assets/proicons/notes.png";
import References from "../assets/proicons/reference.png";
import Settings from "../assets/proicons/settings.png";

export default function NavBar(){

    return( 
        <View style={styles.dash}>
            <NavLink img={Home} title="Home" href="/" />
            <NavLink img={Notes} title="Notes" href="/notes" />
            <NavLink img={References} title="References" href="/references" />
            <NavLink img={Settings} title="Settings" href="/settings" />
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