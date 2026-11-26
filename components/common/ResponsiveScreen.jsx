import React from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

export const BREAKPOINTS = { tablet: 768, desktop: 1100 };

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return {
    width,
    isTablet: width >= BREAKPOINTS.tablet,
    isDesktop: width >= BREAKPOINTS.desktop,
  };
}

export default function ResponsiveScreen({
  children,
  maxWidth = 1100,
  scroll = true,
  backgroundColor = '#F5F7FB',
  contentStyle,
}) {
  const { isTablet, isDesktop } = useBreakpoint();
  const paddingHorizontal = isDesktop ? 48 : isTablet ? 32 : 16;

  const inner = (
    <View style={[styles.inner, { maxWidth, paddingHorizontal }, contentStyle]}>
      {children}
    </View>
  );

  if (!scroll) {
    return <View style={[styles.outer, { backgroundColor }]}>{inner}</View>;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {inner}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center' },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  inner: { width: '100%', flexGrow: 1 },
});