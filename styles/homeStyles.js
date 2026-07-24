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
// Search Bar styles
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

// Quick action Styles
    sectionTitle:{
        fontSize:16,
        fontWeight:"700",
        color:"#111827",
        marginBottom:16,
    },
    actionsGrid:{
        flexDirection:"row",
        flexWrap:"wrap",
        justifyContent:"space-between",
    },
    actionCard:{
        width:"48%",
        backgroundColor:"#FFFFFF",
        paddingVertical:24,
        borderRadius:18,
        alignItems:"center",
        marginBottom:15,
        elevation:2,
    },
    actionTitle:{
        marginTop:12,
        fontSize:14,
        fontWeight:"600",
        color:"#374151",
    },

});

export default styles;