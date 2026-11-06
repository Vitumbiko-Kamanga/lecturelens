
import { StyleSheet } from "react-native";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const TEXT = "#344054";
const MUTED = "#667085";
const BORDER = "#E4E7EC";

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  content: {
    paddingBottom: 110,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: TEXT,
  },

  featureCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 20,
    marginBottom: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
  },

  featureLabel: {
    color: NAVY,
    fontWeight: "700",
    marginBottom: 8,
  },

  featureTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
  },

  featureSubtitle: {
    color: MUTED,
    marginTop: 5,
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 15,
    marginTop: 10,
  },

  itemCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 1,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  itemTitle: {
    marginLeft: 15,
    fontSize: 15,
    fontWeight: "600",
    color: TEXT,
  },
});

export default styles;
