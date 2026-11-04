
import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@clerk/expo";

import styles from "../../styles/homeStyles";

export default function HomeHeader({ userName }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { signOut } = useAuth();

  const initial = userName?.trim()?.[0]?.toUpperCase() || "S";

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const navigateTo = (destination) => {
    closeMenu();
    router.push(destination);
  };

  const handleSignOut = async () => {
    try {
      closeMenu();

      await signOut();

      router.replace("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <>
      <View style={styles.header}>
        {/* Logged-in user's initial */}
        <View style={styles.usernameContainer}>
          <Text style={styles.userName}>{initial}</Text>
        </View>

        {/* LectureLens icon */}
        <Ionicons
          name="binoculars-outline"
          size={28}
          color="#FFFFFF"
        />

        {/* Menu button */}
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          activeOpacity={0.7}
        >
          <Ionicons
            name="menu-outline"
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Navigation menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <View style={menuStyles.overlay}>
          {/* Tap outside to close */}
          <TouchableOpacity
            style={menuStyles.backdrop}
            activeOpacity={1}
            onPress={closeMenu}
          />

          <View style={menuStyles.menu}>
            <View style={menuStyles.menuHeader}>
              <Text style={menuStyles.menuTitle}>
                LectureLens
              </Text>

              <TouchableOpacity
                onPress={closeMenu}
                accessibilityLabel="Close menu"
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#12325B"
                />
              </TouchableOpacity>
            </View>

            <View style={menuStyles.divider} />

            <MenuItem
              icon="folder-open-outline"
              title="Manage Modules"
              onPress={() => navigateTo("/modules")}
            />

            <MenuItem
              icon="document-text-outline"
              title="My Notes"
              onPress={() => navigateTo("/notes")}
            />

            <MenuItem
              icon="book-outline"
              title="References"
              onPress={() => navigateTo("/references")}
            />

            <MenuItem
              icon="settings-outline"
              title="Settings"
              onPress={() => navigateTo("/settings")}
            />

            <View style={menuStyles.divider} />

            <MenuItem
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleSignOut}
              danger
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

function MenuItem({ icon, title, onPress, danger = false }) {
  return (
    <TouchableOpacity
      style={menuStyles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={22}
        color={danger ? "#C0392B" : "#12325B"}
      />

      <Text
        style={[
          menuStyles.menuItemText,
          danger && menuStyles.dangerText,
        ]}
      >
        {title}
      </Text>

      <Ionicons
        name="chevron-forward-outline"
        size={18}
        color="#98A2B3"
      />
    </TouchableOpacity>
  );
}

const menuStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 105,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  menu: {
    width: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },

  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#12325B",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  menuItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#344054",
  },

  dangerText: {
    color: "#C0392B",
  },
});
