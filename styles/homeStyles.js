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

    header:{
        marginTop:50,
        paddingHorizontal:20,
        marginBottom:20,
        flexDirection:"row",
        columnGap: "33%",
        alignItems:"center",

    },

    greeting:{
        fontSize:16,
        color:"#6B7280",
        fontWeight:"500",
    },

    usernameContainer:{
        backgroundColor:"#0e7e0a",
        width: 40,
        height: 40,
        borderRadius: 50,
        alignItems:"center",
       
        
        
    },

    userName:{
        fontSize:18,
        fontWeight:"bold",
        color:"#FFF",
        paddingVertical: 5
        
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
        paddingVertical:10,
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
        color:"#FF8A00",
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
// Recent Lectures
    lectureCard:{
        backgroundColor:"#FFFFFF",
        borderRadius:20,
        padding:20,
        marginBottom:18,
        elevation:2,
    
    },
    cardHeader:{    
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
    },
    lectureTitle:{
        fontSize:16,
        fontWeight:"700",
        color:"#111827",
    },
    lectureDate:{
        color:"#6B7280",
        marginTop:5,
    },
    statusBadge:{
        alignSelf:"flex-start",
        paddingHorizontal:12,
        paddingVertical:6,
        borderRadius:20,
        marginTop:15,
    },
    statusText:{
        color:"#FFFFFF",
        fontWeight:"600",
    },
    buttonRow:{
        flexDirection:"row",
        justifyContent:"space-between",
        marginTop:20,
    },
    primaryButton:{
        flex:1,
        backgroundColor:"#2563EB",
        padding:12,
        borderRadius:12,
        alignItems:"center",
        marginRight:10,
    },
    secondaryButton:{
        flex:1,
        borderWidth:1,
        borderColor:"#2563EB",
        padding:12,
        borderRadius:12,
        alignItems:"center",
    },
    primaryButtonText:{
        color:"#FFFFFF",
        fontWeight:"700",
    },
    secondaryButtonText:{
        color:"#2563EB",
        fontWeight:"700",
    },

    // The floating Record Button
    floatingButton:{
        position:"absolute",
        bottom:90,
        right:25,
        width:65,
        height:65,
        borderRadius:35,
        backgroundColor:"#FF8A00",
        justifyContent:"center",
        alignItems:"center",
        elevation:8,
    
    },

});

export default styles;