import { StyleSheet, Text, View,Image } from "react-native";
import React from "react";
import {Link} from "expo-router";

export default function NavLink({img, title, href}){
    return(
        
        <View style={styles.container}>
            <Link href={href}>
                <View style={styles.link}>
                    {img ? <Image source={img} style={styles.img} /> : null}
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