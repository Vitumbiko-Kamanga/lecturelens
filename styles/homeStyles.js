import { StyleSheet } from "react-native";

const NAVY = "#12325B";
const GOLD = "#F2B544";
const BACKGROUND = "#F5F7FB";
const WHITE = "#FFFFFF";
const TEXT = "#344054";
const MUTED = "#667085";
const BORDER = "#E2E8F0";

const styles = StyleSheet.create({
  main: {
    flex: 1,
    width: "100%",
    backgroundColor: BACKGROUND,
  },

  container: {
    flex: 1,
    width: "100%",
    backgroundColor: BACKGROUND,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  header: {
    width: "100%",
    backgroundColor: NAVY,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  usernameContainer: {
    backgroundColor: GOLD,
    width: 42,
    height: 42,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: NAVY,
  },

  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: NAVY,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 16,
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  actionCard: {
    width: "48%",
    backgroundColor: WHITE,
    paddingVertical: 24,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
  },

  actionTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: TEXT,
  },

  lectureCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  lectureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },

  lectureDate: {
    color: MUTED,
    marginTop: 5,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 15,
    backgroundColor: NAVY,
  },

  statusText: {
    color: WHITE,
    fontWeight: "600",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: NAVY,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 10,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: NAVY,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryButtonText: {
    color: WHITE,
    fontWeight: "700",
  },

  secondaryButtonText: {
    color: NAVY,
    fontWeight: "700",
  },

  floatingButton: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: GOLD,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    zIndex: 10,
  },
});

export default styles;
