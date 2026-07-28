import { StyleSheet, Text, View,Image } from "react-native";
import React from "react";
import {Link} from "expo-router";
import {Ionicons} from "@expo/vector-icons"

export default function NavLink({title, name, href}){
    return(
        
        <View style={styles.container}>
            <Link href={href}>
                <View style={styles.link}>
                    <Ionicons
                        name={name}
                        size={25}
                        color="#777"
                    />
                    <Text style={styles.dashItem}>{title}</Text>
                </View>
            </Link>
            
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        paddingTop:10,
    },
    link:{
        flexDirection:"column",
        alignItems:"center",
    },
    dashItem:{
        fontSize:12,
        color:"#555",
        paddingTop:5,
    },
    img:{
        width:25,
        height:25,
    }
})