import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

    container:{
        flex:1,
        backgroundColor:"#F5F7FB",
        paddingHorizontal:20,
        paddingTop:60,
    },

    header:{
        marginBottom:20,
    },

    greeting:{
        fontSize:16,
        color:"#6B7280",
        fontWeight:"500",
    },

    userName:{
        fontSize:20,
        fontWeight:"bold",
        color:"#111827",
    },

    tagline:{
        fontSize:14,
        color:"#2563EB",
        marginTop:2,
    },
    
    searchSection:{
        flexDirection:"row",
        alignItems:"center",
        backgroundColor:"#FFFFFF",
        paddingHorizontal:16,
        paddingVertical:12,
        borderRadius:16,
        marginBottom:30,
        elevation:2,
    },
    searchInput:{
        flex:1,
        marginLeft:10,
        fontSize:16,
        color:"#111827",
    },

});

export default styles;