import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";

import NavLink from "./navelement.jsx";

const NAVY = "#12325B";
const WHITE = "#FFFFFF";
const BORDER = "#E2E8F0";

export default function NavBar({ fullBleed = false }) {
  const { width } = useWindowDimensions();

  const gutter = width >= 1100 ? 48 : width >= 768 ? 32 : 16;

  return (
    <View
      style={[
        styles.dash,
        fullBleed
          ? {
              left: 0,
              right: 0,
            }
          : {
              left: -gutter,
              right: -gutter,
            },
      ]}
    >
      <NavLink
        name="home-outline"
        title="Home"
        href="/home"
      />

      <NavLink
        name="book-outline"
        title="Notes"
        href="/notes"
      />

      <NavLink
        name="reader-outline"
        title="References"
        href="/references"
      />

      <NavLink
        name="settings-outline"
        title="Settings"
        href="/settings"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dash: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    elevation: 12,
    zIndex: 20,
    shadowColor: NAVY,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
});
