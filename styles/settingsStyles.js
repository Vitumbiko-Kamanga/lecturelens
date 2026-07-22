import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    elevation: 2,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 35,
    backgroundColor: "#EAF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },

  email: {
    marginTop: 4,
    color: "#666",
    fontSize: 14,
  },

  section: {
    marginVertical: 15,
    fontSize: 15,
    fontWeight: "bold",
    color: "#777",
    letterSpacing: 1,
  },

  row: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    elevation: 1,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  textContainer: {
    marginLeft: 15,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  itemSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
  },

  logout: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginVertical: 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#FFD9D9",
  },

  logoutText: {
    color: "#E53935",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 10,
  },

});

export default styles;