import { StyleSheet } from "react-native";

export default StyleSheet.create({

    main:{
        flex:1,
        backgroundColor:"#ff8a00",
    },

    container:{
        flex:1,
        backgroundColor:"#F8FAFC",
        paddingHorizontal:20,
        paddingTop:10
    },

    sectionTitle:{
        fontSize:16,
        fontWeight:"700",
        color:"#FF8A00",
        marginBottom:15
    },

    statsContainer:{
        flexDirection:"row",
        justifyContent:"space-between",
        marginBottom:20
    },

    statCard:{
        width:"31%",
        backgroundColor:"#FFFFFF",
        borderRadius:18,
        paddingVertical:20,
        alignItems:"center",
        elevation:2
    },

    statNumber:{
        fontSize:16,
        fontWeight:"700",
        color:"#2563EB"
    },

    statLabel:{
        marginTop:5,
        color:"#6B7280"
    },

    moduleCard:{
        backgroundColor:"#FFFFFF",
        borderRadius:20,
        padding:18,
        marginBottom:18,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        elevation:2
    },

    leftSection:{
        flexDirection:"row",
        alignItems:"center",
        flex:1
    },

    folderIcon:{
        width:50,
        height:50,
        borderRadius:15,
        justifyContent:"center",
        alignItems:"center",
        marginRight:15
    },

    moduleTitle:{
        fontSize:16,
        fontWeight:"700",
        color:"#111827"
    },

    moduleNotes:{
        marginTop:3,
        color:"#6B7280"
    },

    moduleUpdated:{
        marginTop:3,
        fontSize:12,
        color:"#9CA3AF"
    }

});