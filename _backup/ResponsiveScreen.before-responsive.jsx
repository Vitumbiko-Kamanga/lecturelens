import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';

export default function ResponsiveScreen({ children, style }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width > 768;

  return (
    <View style={[styles.outerContainer, style]}>
      <View style={[styles.container, isDesktop && styles.desktopContainer]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#ffffff',
  },
  desktopContainer: {
    width: '100%',
    maxWidth: 480,
    height: '85vh',
    maxHeight: 900,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: 24,
    overflow: 'hidden',
  },
});
