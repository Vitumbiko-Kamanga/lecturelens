import { StyleSheet } from "react-native";

const NAVY = "#12325B";
const GOLD = "#F2B544";

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: NAVY,
  },

  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
  },

  header: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: NAVY,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E5EAF2",
    elevation: 2,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#FFF6E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderBottomWidth: 3,
    borderBottomColor: GOLD,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: NAVY,
  },

  email: {
    marginTop: 4,
    color: "#667085",
    fontSize: 13,
  },

  section: {
    marginTop: 18,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: "bold",
    color: NAVY,
    letterSpacing: 1.5,
  },

  row: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8ECF3",
    elevation: 1,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  textContainer: {
    marginLeft: 14,
    flex: 1,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },

  itemSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#667085",
  },

  logout: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 17,
    marginTop: 25,
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#FFD9D9",
  },

  logoutText: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default styles;
