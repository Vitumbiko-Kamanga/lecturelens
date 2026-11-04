
import { StyleSheet } from "react-native";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const TEXT = "#344054";
const MUTED = "#667085";
const BORDER = "#E2E8F0";

export default StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: NAVY,
  },

  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // Section headings - consistent with Home screen
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 16,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    width: "31%",
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
  },

  statLabel: {
    marginTop: 5,
    color: MUTED,
    fontSize: 12,
  },

  moduleCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  folderIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "#FFF6DF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  moduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },

  moduleNotes: {
    marginTop: 3,
    color: TEXT,
  },

  moduleUpdated: {
    marginTop: 3,
    fontSize: 12,
    color: MUTED,
  },
});
