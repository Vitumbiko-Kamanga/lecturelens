import { StyleSheet, Text, View, Button,Image } from "react-native";
import React from "react";
import {Link} from "expo-router";

import NavBar from "../components/navbar.jsx";

export default function Home(){

    return(
        
        <View style={styles.container}>

            <Text style={styles.title}>
                LectureLens
            </Text>

            <Text style={styles.subtitle}>
                Your AI Lecture Assistant
            </Text>

            <Text style={styles.btn}>
                Get Started
            </Text>
            {/* <Link href="/notes">View Notes</Link> */}
            {/* calling the navigation bar */}
            <NavBar />
            
        </View>

    );

}



const styles = StyleSheet.create({

    container:{

        flex:1,

        backgroundColor:"#ffffff",

        alignItems:"center",

        justifyContent:"center"

    },


    title:{

        fontSize:32,

        fontWeight:"bold",

        color:"#1e3a8a"

    },


    subtitle:{

        fontSize:18,

        marginTop:10,

        color:"#555"

    },
    btn:{
        padding:12,
        backgroundColor:"#1e3a8a",
        borderRadius:10,
        marginTop:20,
        color:"#fff",
        fontWeight:"bold",
    },

});