import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

    main:{
        flex:1,
        backgroundColor:"#ff8a00",
    },

    container:{
        flex:1,
        backgroundColor:"#F5F7FB",
        paddingHorizontal:20,
        paddingTop:10,
    },

    searchBar:{
        flexDirection:"row",
        alignItems:"center",
        backgroundColor:"#FFFFFF",
        borderRadius:18,
        paddingHorizontal:15,
        paddingVertical:12,
        marginBottom:25,
        elevation:2,
    },

    searchInput:{
        flex:1,
        marginLeft:10,
        fontSize:16,
    },

    featureCard:{
        backgroundColor:"#FFFFFF",
        borderRadius:20,
        padding:22,
        marginBottom:30,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        elevation:2,
    },

    featureLabel:{
        color:"#FF8A00",
        fontWeight:"700",
        marginBottom:8,
    },

    featureTitle:{
        fontSize:16,
        fontWeight:"bold",
        color:"#111827",
    },

    featureSubtitle:{
        color:"#6B7280",
        marginTop:5,
    },

    sectionTitle:{
        fontSize:16,
        fontWeight:"700",
        color:"#FF8A00",
        marginBottom:15,
        marginTop:10,
    },

    itemCard:{
        backgroundColor:"#FFFFFF",
        borderRadius:16,
        padding:18,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        marginBottom:12,
        elevation:2,
    },

    left:{
        flexDirection:"row",
        alignItems:"center",
    },

    itemTitle:{
        marginLeft:15,
        fontSize:16,
        fontWeight:"600",
        color:"#374151",
    }

});

export default styles;